/* eslint-disable no-console */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { promisify } from 'util'
import { exec } from 'child_process'

// Advisory severities
const SeverityLevels = <const>['low', 'moderate', 'high', 'critical']
type SeverityLevel = typeof SeverityLevels[number]

interface Advisory {
  id: number
  title: string
  severity: SeverityLevel
  url: string
  findings: {
    version: string
    paths: string[]
  }[]
}

interface AuditJson {
  advisories: { [x: number]: Advisory }
  metadata: { totalDependencies: number }
}

const pnpmAuditJson = async (): Promise<AuditJson> => {
  const pnpmAudit = async (): Promise<string> => {
    try {
      const { stdout } = await promisify(exec)(`pnpm audit --json`)
      return stdout
    } catch ({ stdout }) {
      return stdout
    }
  }
  return <AuditJson>JSON.parse(await pnpmAudit())
}

const audit = async () => {
  // Parse minimum severity level and advisory exclusions from command line arguments
  const [level = 'low', ...excluding] = process.argv.slice(2).map(arg => arg.toLowerCase())
  const minSeverityLevel = SeverityLevels.indexOf(<SeverityLevel>level)
  if (minSeverityLevel < 0 || (excluding.length > 0 && excluding.some(id => !/^-?\d+$/.test(id)))) {
    console.log(`Usage: check-advisories <${SeverityLevels.join('|')}> [...list of numeric advisory ids to exclude]"`)
    return 1
  }

  // Set exclusions
  const exclusions = excluding.map(id => `https://npmjs.com/advisories/${id}`)

  // Get advisories
  console.log(`Running: pnpm audit --json --audit-level=${SeverityLevels[minSeverityLevel]}`)

  const {
    advisories,
    metadata: { totalDependencies }
  } = await pnpmAuditJson()

  // Ignore advisories below minimum severity level or excluded
  const vulnerabilities = Object.values(advisories)
    .filter(({ url }) => !exclusions.includes(url))
    .filter(({ severity }) => SeverityLevels.indexOf(severity) >= minSeverityLevel)

  // Detect outdated exclusions
  const outdated = exclusions.filter(
    exclusion => !Object.values(advisories).some(advisory => advisory.url === exclusion)
  )

  // Display results
  console.log(
    `Found ${vulnerabilities.length === 0 ? 'no' : `${vulnerabilities.length}`} ${
      vulnerabilities.length === 1 ? 'vulnerability' : 'vulnerabilities'
    } in ${totalDependencies} dependencies${excluding.length > 0 ? ` (excluding ${excluding.join(', ')})` : ''}`
  )

  // Display vulnerabilities
  vulnerabilities.forEach(({ id, title, severity, url, findings }) => {
    console.log(` - ${url}: ${title} (${severity.toUpperCase()})`)
    findings.forEach(({ version, paths }) => {
      paths.forEach(path => {
        console.log(`    - ${path.replace(/>/g, ' > ')}@${version}`)
      })
    })
  })

  // Display outdated exclusions
  outdated.forEach(exclusion => {
    console.log(`Advisory exclusion for ${exclusion} is no longer required`)
  })

  // Exit with code representing the number of vulerabilities found
  process.exit(vulnerabilities.length)
}

// Run the audit
audit()
