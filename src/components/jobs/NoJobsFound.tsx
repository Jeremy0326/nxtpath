import React from "react";

const NoJobsFound: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
      color: '#555',
      background: '#fafbfc',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minHeight: '220px',
      width: '100%'
    }}>
      <svg width="64" height="64" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ marginBottom: 16 }}>
        <circle cx="12" cy="12" r="10" fill="#e0e7ef" />
        <path d="M8 15h8M9 10h.01M15 10h.01" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>No Jobs Found</h2>
      <p style={{ margin: '12px 0 0', fontSize: '1rem', color: '#888', textAlign: 'center', maxWidth: 320 }}>
        We couldn't find any jobs matching your search. Try adjusting your filters or check back later for new opportunities.
      </p>
    </div>
  );
};

export default NoJobsFound; 