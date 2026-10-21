import React from 'react';
import { BarChart3, PieChart, TrendingUp, CheckCircle, Clock } from 'lucide-react';

/**
 * TaskAnalytics - Heavy visualization component loaded on-demand via React.lazy()
 * (Practical 8 Step 6 Supplementary Optimization)
 */
function TaskAnalytics({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const high = tasks.filter((t) => t.priority === 'high').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  return (
    <div className="card" style={{ marginTop: '1.5rem', borderColor: 'var(--primary)', backgroundColor: 'rgba(30, 41, 59, 0.9)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Task Metrics & Analytics</h3>
        </div>
        <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', fontWeight: 600 }}>
          Component-Level Code Splitting Active
        </span>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tasks</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>{total}</p>
        </div>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Completed</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--success)' }}>{completed}</p>
        </div>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>Pending</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--warning)' }}>{pending}</p>
        </div>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Completion Rate</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--primary)' }}>{completionRate}%</p>
        </div>
      </div>

      {/* SVG Visualization Bars */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <span>Overall Progress ({completed} of {total} completed)</span>
            <span>{completionRate}%</span>
          </div>
          <div style={{ height: '10px', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${completionRate}%`,
                backgroundColor: 'var(--success)',
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <span>Priority Breakdown (High: {high}, Medium: {medium}, Low: {low})</span>
          </div>
          <div style={{ height: '10px', backgroundColor: 'var(--border)', borderRadius: '5px', display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: total > 0 ? `${(high / total) * 100}%` : '0%', backgroundColor: 'var(--danger)' }} title={`High: ${high}`} />
            <div style={{ width: total > 0 ? `${(medium / total) * 100}%` : '0%', backgroundColor: 'var(--warning)' }} title={`Medium: ${medium}`} />
            <div style={{ width: total > 0 ? `${(low / total) * 100}%` : '0%', backgroundColor: 'var(--primary)' }} title={`Low: ${low}`} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} /> High
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} /> Medium
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} /> Low
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAnalytics;
