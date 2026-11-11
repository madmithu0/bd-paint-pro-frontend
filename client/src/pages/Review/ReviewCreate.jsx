import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ReviewCreate = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState([]); // Clean Work, On Time, Good Behavior, Price Fair
  const [photos, setPhotos] = useState([]);

  const TAG_OPTIONS = [
    { value: 'clean', label: '🧹 Clean Work' },
    { value: 'on_time', label: '⏰ On Time' },
    { value: 'good_behavior', label: '😊 Good Behavior' },
    { value: 'price_fair', label: '💰 Price Fair' },
    { value: 'quality', label: '⭐ Quality Good' },
    { value: 'fast', label: '⚡ Fast Work' },
  ];

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${jobId}`);
      setJob(data?.job || data);
    } catch {
      toast.error('Job Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [jobId]);

  const toggleTag = (val) => {
    setTags(tags.includes(val) ? tags.filter((t) => t !== val) : [...tags, val]);
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error('Rating দিন');
    if (!comment.trim()) return toast.error('Comment লিখুন');
    const fd = new FormData();
    fd.append('jobId', jobId);
    fd.append('rating', rating);
    fd.append('comment', comment);
    fd.append('tags', JSON.stringify(tags));
    photos.forEach((f) => fd.append('photos', f));

    setSubmitting(true);
    try {
      await api.post('/reviews', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Review Submitted - Approve হলে Show হবে');
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review Submit Failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to={`/jobs/${jobId}`} className="text-blue-600 text-sm">← Back to Job</Link>
      <h1 className="text-2xl font-bold mt-2">Review দিন</h1>
      <p className="text-sm text-gray-500">{job.title || job.address} • {job.sqft} Sqft</p>

      <div className="bg-white rounded-xl shadow p-5 mt-3 space-y-5">
        {/* Star Rating */}
        <div className="text-center">
          <p className="font-bold">কাজ কেমন হয়েছে?</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className={`text-5xl ${(hover || rating) >= star ? 'text-yellow-500' : 'text-gray-200'}`}>★</button>
            ))}
          </div>
          <p className="font-bold text-yellow-600 mt-1">{rating}.0 / 5.0 - {rating === 5 ? 'অসাধারণ!' : rating === 4 ? 'খুব ভালো' : rating === 3 ? 'মোটামুটি' : rating === 2 ? 'খারাপ' : 'খুব খারাপ'}</p>
        </div>

        {/* Tags */}
        <div>
          <label className="font-bold">কী ভালো লেগেছে? (Tag Select)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TAG_OPTIONS.map((t) => (
              <button key={t.value} type="button" onClick={() => toggleTag(t.value)} className={`px-3 py-1.5 rounded-full text-sm border ${tags.includes(t.value) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="font-bold">Comment *</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="কাজের অভিজ্ঞতা লিখুন..." className="w-full border rounded-lg p-3 mt-1" />
        </div>

        {/* Photo */}
        <div>
          <label className="font-bold">Photo Upload (Optional)</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files)])} className="w-full border rounded-lg p-2 mt-1" />
          <div className="flex gap-2 mt-2 flex-wrap">{photos.map((f, i) => <img key={i} src={URL.createObjectURL(f)} className="w-16 h-16 object-cover rounded" alt="" />)}</div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
          {submitting ? 'Submitting...' : `Submit Review - ${rating} ★`}
        </button>
      </div>
    </div>
  );
};

export default ReviewCreate;