import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { FileText, Shield } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAuditLogs({ limit: 50 });
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load audit trail logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Tamper-Evident System Audit Trail
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Immutable system events documenting user registrations, status decisions, moderation, and pickup handovers.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading system logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit logs recorded"
          description="System actions will be recorded here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm divide-y divide-surface-100 font-mono text-xs">
          <div className="bg-surface-50 px-5 py-3 flex items-center justify-between text-surface-500 font-bold uppercase tracking-wider text-[11px]">
            <span>Action & Entity</span>
            <span>Performed By / Timestamp</span>
          </div>

          {logs.map((log) => (
            <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-50/50 transition-colors">
              <div>
                <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded mr-2">
                  {log.action}
                </span>
                <span className="text-surface-600">
                  {log.entityType} ({log.entityId})
                </span>
                {log.details && (
                  <p className="text-[11px] text-surface-400 mt-1 font-sans">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                  </p>
                )}
              </div>

              <div className="text-right text-[11px] text-surface-500">
                <p className="font-semibold text-surface-800 font-sans">{log.user?.name || log.user?.email || 'System'}</p>
                <p className="text-surface-400">{formatDateTime(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
