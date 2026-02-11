'use client';

export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '12px 30px',
        fontSize: '1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Get New Fact
    </button>
  );
}
