import RefreshButton from './RefreshButton';

interface CatFactResponse {
  fact: string;
  length: number;
}

async function getCatFact(): Promise<string> {
  try {
    const res = await fetch('https://catfact.ninja/fact', {
      cache: 'no-store', // Ensures fresh data on every request
    });

    if (!res.ok) {
      throw new Error('Failed to fetch cat fact');
    }

    const data: CatFactResponse = await res.json();

    return data.fact;
  } catch (error) {
    console.error('Error fetching cat fact:', error);
    return 'Failed to load cat fact. Please refresh the page to try again.';
  }
}

export default async function Home() {
  const catFact = await getCatFact();

  return (
    <main style={{
      maxWidth: '800px',
      width: '100%',
      padding: '40px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '10px',
          color: '#667eea',
        }}>
          🐱
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: '#333',
          marginBottom: '10px',
        }}>
          Cat Fact of the Moment
        </h2>
        <p style={{
          color: '#666',
          fontSize: '0.9rem',
        }}>
          Refresh the page for a new fact
        </p>
      </div>

      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderRadius: '15px',
        border: '2px solid #667eea20',
      }}>
        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.8',
          color: '#444',
          textAlign: 'center',
        }}>
          {catFact}
        </p>
      </div>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
      }}>
        <RefreshButton />
      </div>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        color: '#999',
        fontSize: '0.8rem',
      }}>
        <p>Data provided by Cat Facts API</p>
      </div>
    </main>
  );
}
