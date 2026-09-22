import { useQuery } from '@tanstack/react-query';
import { StateBlock } from '@/components/ui/StateBlock';
import { usePageTitle } from '@/hooks/usePageTitle';
import { summaryApi } from '@/api/summary.api';

export function SummaryPage() {
  usePageTitle('Overall Summary');

  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: summaryApi.get,
  });

  return (
    <div>
      <h2>Overall Analytics & Summary</h2>

      {summaryQuery.isLoading ? (
        <StateBlock kind="loading" message="Loading summary…" />
      ) : summaryQuery.isError ? (
        <StateBlock
          kind="error"
          message="Could not load summary."
          onRetry={() => summaryQuery.refetch()}
        />
      ) : (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Active Members</h4>
            <span
              className="big-stat"
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                display: 'block',
                marginTop: 8,
              }}
            >
              {summaryQuery.data?.activeMembers ?? 0}
            </span>
          </div>

          <div className="analytics-card">
            <h4>Memos Released</h4>
            <span
              className="big-stat"
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                display: 'block',
                marginTop: 8,
              }}
            >
              {summaryQuery.data?.memosReleased ?? 0}
            </span>
          </div>

          <div className="analytics-card">
            <h4>Meetings Held</h4>
            <span
              className="big-stat"
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                display: 'block',
                marginTop: 8,
              }}
            >
              {summaryQuery.data?.meetingsHeld ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}