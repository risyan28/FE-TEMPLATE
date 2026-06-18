import { execSync } from 'child_process'
execSync('react-router typegen', { stdio: 'inherit' })
execSync('tsc --noEmit', { stdio: 'inherit' })
