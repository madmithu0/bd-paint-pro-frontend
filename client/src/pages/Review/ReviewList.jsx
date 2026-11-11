import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | approved | rejected
  const [ratingFilter, setRatingFilter] = useState('all'); // all | 5 | 4 | 3 | 2 | 1

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews', { params: { status: filter === 'all' ? '' : filter } });
      setReviews(data?.reviews || data || []);
    } catch {
      toast.error('Review Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  // Review Approve Reject
  const handleStatus = async (reviewId, status) => {
    try {
      await api.put(`/reviews/${reviewId}/status`, { status });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch {
      toast.error('Status Change Failed');
    }
  };

  const filtered = ratingFilter === 'all' ? reviews : reviews.filter((r) => r.rating === Number(ratingFilter));

  // Average Rating
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0';
  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;

  const renderStars = (rating) => (
    <span className="text-yellow-500 text-lg">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Review List ({filtered.length})</h1>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow p-4 mt-3 flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">{avg} / 5</p>
          {renderStars(Math.round(avg))}
          <p className="text-sm text-gray-500">{reviews.length} Reviews • 5★: {count5} • 4★: {count4}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Pending: <b>{reviews.filter((r) => r.status === 'pending').length}</b></p>
          <p className="text-sm">Approved: <b className="text-green-600">{reviews.filter((r) => r.status === 'approved').length}</b></p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {['all', '5', '4', '3', '2', '1'].map((r) => (
          <button key={r} onClick={() => setRatingFilter(r)} className={`px-3 py-1 rounded-full text-sm ${ratingFilter === r ? 'bg-yellow-500 text-white' : 'bg-white border'}`}>{r === 'all' ? 'All Rating' : `${r} ★`}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Review নাই</p>}

      <div className="space-y-3 mt-3">
        {filtered.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <img src={review.customer?.avatar || review.mistri?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold">{review.customer?.name || review.mistri?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-400">{review.job?.title || 'Job'} • {new Date(review.createdAt).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs h-fit capitalize ${review.status === 'approved' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{review.status || 'pending'}</span>
            </div>

            <div className="mt-2">{renderStars(review.rating || 5)} <span className="font-bold ml-1">{review.rating}.0</span></div>
            <p className="text-sm mt-1">{review.comment || review.text}</p>

            {review.photos?.length > 0 && (
              <div className="flex gap-2 mt-2">{review.photos.map((p, i) => <img key={i} src={p} className="w-16 h-16 object-cover rounded" alt="" />)}</div>
            )}

            {/* Mistri Reply Show */}
            {review.reply && (
              <div className="bg-blue-50 rounded-lg p-3 mt-2 text-sm">
                <p className="font-bold">Mistri Reply:</p>
                <p>{review.reply}</p>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleStatus(review._id, 'approved')} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold">Approve</button>
              <button onClick={() => handleStatus(review._id, 'rejected')} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;