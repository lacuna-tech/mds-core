import { execSync } from 'child_process'

export const gitHash = () => {
  return execSync('git rev-parse --short HEAD').toString().trim()
}

export const gitBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
}

export const nodeVersion = () => {
  return execSync('node --version').toString().trim()
}

export const packageVersion = (pkg: string) => {
  return execSync('node -p "require(\'./container-images/' + pkg + '/package.json\').version"').toString().trim()
}

export const isIsoDate = (date : string) => {
  return (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(date)) ? false : new Date(date).toISOString() == date;
}