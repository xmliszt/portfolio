// Changelog filenames are `major.minor` from 2.12 onward; earlier releases carry a
// trailing build number that stays in their filenames and public URLs. Either way the
// build is an implementation detail — only `major.minor` is ever shown to readers.
export function formatDisplayVersion(version: string) {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}
