import React from 'react';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div style={{
            overflowX: 'auto',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} style={{
                                textAlign: 'left',
                                padding: '1rem',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
            <style>{`
        tr:not(:last-child) { border-bottom: 1px solid var(--border); }
        tr:hover { background: rgba(255, 255, 255, 0.02); }
        td { padding: 1rem; color: var(--text-main); font-size: 0.875rem; }
      `}</style>
        </div>
    );
};

export default Table;
