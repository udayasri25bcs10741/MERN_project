import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null,
  trendType = 'up',
  color = 'primary',
}) {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="stat-card border border-surface-200 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-surface-900 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorStyles[color] || colorStyles.primary}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold ${
                trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trendType === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-surface-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
