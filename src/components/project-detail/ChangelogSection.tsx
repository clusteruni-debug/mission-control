import { Section } from './Section';

interface ChangelogSectionProps {
  changelog: string | null;
}

export function ChangelogSection({ changelog }: ChangelogSectionProps) {
  return (
    <Section title="CHANGELOG">
      {changelog ? (
        <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {changelog.slice(0, 3000)}
            {changelog.length > 3000 && '\n\n... (잘림)'}
          </pre>
        </div>
      ) : (
        <p className="text-sm text-gray-400">CHANGELOG 파일이 없습니다</p>
      )}
    </Section>
  );
}
