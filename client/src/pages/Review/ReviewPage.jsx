import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function ReviewPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews', { params: { jobId } });
        if (active) setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      } catch {
        // Ignore if no prior reviews exist
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReviews();
    return () => {
      active = false;
    };
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      error('Please select a star rating between 1 and 5.');
      return;
    }
    if (!comment.trim()) {
      error('Please write a brief review comment.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        jobId,
        rating,
        comment: comment.trim(),
      });
      success('Thank you! Your review has been submitted.');
      navigate(`/jobs/${jobId}`, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/jobs/${jobId}`}
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Rate & Review Service</h1>
          <p className="text-xs text-gray-500">
            Share feedback on Mistri workmanship, punctuality, and finishing quality
          </p>
        </div>
      </div>

      <Card title="Submit Your Rating">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Overall Star Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-slate-700'
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-gray-700 dark:text-slate-300">
                {rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Written Review</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the wall finishing, cleanliness, and adherence to the 450 Sqft/day timeline..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {submitting ? 'Submitting Review...' : 'Publish Review'}
          </button>
        </form>
      </Card>

      {reviews.length > 0 && (
        <Card title="Submitted Reviews for This Job">
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {reviews.map((rev) => (
              <div key={rev._id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(rev.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
