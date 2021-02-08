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
}

const getAdvisories = async (): Promise<Advisory[]> => {
  try {
    await promisify(exec)(`pnpm audit --json`)
    return []
  } catch ({ stdout }) {
    try {
      return Object.values<Advisory>(JSON.parse(stdout).advisories)
    } catch (error) {
      console.error(error)
      return []
    }
  }
}

const audit = async () => {
  // Parse minimum severity level and advisory exclusions from command line arguments
  const [, , level, ...excluding] = process.argv.map(arg => arg.toLowerCase())
  const minSeverityLevel = SeverityLevels.indexOf(<SeverityLevel>level)
  if (minSeverityLevel < 0 || excluding.some(id => !/^-?\d+$/.test(id))) {
    console.log(`Usage: "pnpm-audit <${SeverityLevels.join('|')}> [...list of numeric advisory ids to exclude]"`)
    return 1
  }
  const minSeverity = SeverityLevels[minSeverityLevel]

  // Set exclusions
  const exclusions = excluding.map(id => `https://npmjs.com/advisories/${id}`)

  // Get advisories
  console.log(`Auditing dependencies for${minSeverity === 'low' ? ' ' : ` ${minSeverity} severity `}vulnerabilities`)
  const advisories = await getAdvisories()

  // Check for outdated exclusions
  exclusions
    .filter(exclusion => !advisories.some(advisory => advisory.url === exclusion))
    .forEach(exclusion => {
      console.log(`Advisory exclusion for ${exclusion} is no longer required`)
    })

  // Ignore advisories below minimum severity level or excluded
  const vulnerabilities = advisories
    .filter(({ url }) => !exclusions.includes(url))
    .filter(({ severity }) => SeverityLevels.indexOf(severity) >= minSeverityLevel)

  // Display vulnerabilities
  vulnerabilities.forEach(({ id, title, severity, url }) => {
    console.log(`Found ${severity.toUpperCase()} vulnerablity: ${id}: ${title} (${url})`)
  })

  console.log(
    vulnerabilities.length === 0
      ? `No vulnerabilities found${excluding.length > 0 ? ` (excluding ${excluding})` : ''}`
      : `Run "npm audit --json --audit-level=${minSeverity}" for details`
  )

  return vulnerabilities.length
}

// Run the audit
audit().then(code => process.exit(code))
