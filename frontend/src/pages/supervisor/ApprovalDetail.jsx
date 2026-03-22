import { useParams } from 'react-router-dom';

export default function ApprovalDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="text-center p-10 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-3xl font-bold text-white mb-2">Approval Detail</h1>
        <p style={{ color: '#888888' }}>Approval ID: {id}</p>
      </div>
    </div>
  );
}
