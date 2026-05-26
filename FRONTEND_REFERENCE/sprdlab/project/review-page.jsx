/* global React, MOCK_COMPLETED_ORDER, cx, Btn, Badge, formatPrice, formatDate */
const { useState: useReviewState } = React;

// ---------------------------------------------------------------
// SPRDlab — Review page (shown after project is completed + paid)
// ---------------------------------------------------------------

const STAR_LABELS = ['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'];

const QUICK_TAGS = [
  'Professional',
  'Fast delivery',
  'Creative',
  'Responsive',
  'Great quality',
  'Exceeded expectations',
  'Good communication',
  'Will order again',
];

function ReviewPage({ context, onNavigate }) {
  const order = context || MOCK_COMPLETED_ORDER;

  const [rating, setRating] = useReviewState(0);
  const [hovered, setHovered] = useReviewState(0);
  const [comment, setComment] = useReviewState('');
  const [tags, setTags] = useReviewState([]);
  const [anon, setAnon] = useReviewState(false);
  const [submitted, setSubmitted] = useReviewState(false);

  const displayRating = hovered || rating;

  function toggleTag(tag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function handleSubmit() {
    if (rating === 0) return;
    setSubmitted(true);
  }

  /* ── Thank-you state ── */
  if (submitted) {
    return (
      <div>
        <header className="sprd-header">
          <span className="sprd-crumb">Review submitted</span>
        </header>
        <div className="review-page">
          <div className="review-thanks">
            <div className="review-thanks-icon">
              <i className="ri-check-line"></i>
            </div>
            <h2 className="review-thanks-h">Thanks for the feedback!</h2>
            <p className="review-thanks-sub">
              Your review helps other clients make better decisions and motivates our team to keep raising the bar.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="outline" onClick={() => onNavigate('home')}>
                <i className="ri-home-2-line"></i> Back to home
              </Btn>
              <Btn onClick={() => onNavigate('products')}>
                Browse more services <i className="ri-arrow-right-line"></i>
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Review form ── */
  return (
    <div>
      <header className="sprd-header">
        <span className="sprd-crumb">Write a Review</span>
        <div className="sprd-header-actions">
          <button className="sprd-icon-btn" onClick={() => onNavigate('projects')}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      </header>

      <div className="review-page">

        {/* ── Completion banner ── */}
        <div className="review-completion">
          <span className="review-completion-badge">
            <i className="ri-check-double-line"></i> Project Completed
          </span>
          <div className="review-completion-icon">
            <i className="ri-checkbox-circle-line"></i>
          </div>
          <h1 className="review-completion-h">Your project is complete!</h1>
          <p className="review-completion-sub">
            We've finished your project. Take a moment to share your experience — it helps us improve and helps other clients choose confidently.
          </p>
        </div>

        {/* ── Order summary ── */}
        <div className="review-order-card">
          <div className="review-order-thumb" style={{ background: order.product_tint }}>
            <i className={`ri-${order.product_icon}`}></i>
          </div>
          <div className="review-order-info">
            <div className="review-order-product">{order.product_name}</div>
            <div className="review-order-id">{order.id}</div>
            <div className="review-order-meta">
              <span className="review-order-meta-item">
                <i className="ri-folder-line"></i> {order.project_name}
              </span>
              <span className="review-order-meta-item">
                <i className="ri-calendar-check-line"></i> Completed {formatDate(order.completed_at)}
              </span>
              <span className="review-order-meta-item">
                <i className="ri-money-dollar-circle-line"></i> {formatPrice(order.ordered_price)}
              </span>
            </div>
          </div>
          <Badge variant="success" icon="check-line">Completed</Badge>
        </div>

        {/* ── Form card ── */}
        <div className="review-form-card">

          {/* Star rating */}
          <div>
            <div className="review-form-label">Rate your experience</div>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={cx('star-btn', star <= displayRating && 'star-btn--on')}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`${star} star`}
                >
                  <i className={star <= displayRating ? 'ri-star-fill' : 'ri-star-line'}></i>
                </button>
              ))}
            </div>
            <div className="star-label">
              {displayRating > 0 ? STAR_LABELS[displayRating] : 'Select a rating to continue'}
            </div>
          </div>

          {/* Quick tags */}
          <div>
            <div className="review-form-label">
              What stood out?
              <span className="review-form-sub">(optional)</span>
            </div>
            <div className="review-tags">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  className={cx('review-tag', tags.includes(tag) && 'review-tag--on')}
                  onClick={() => toggleTag(tag)}
                >
                  {tags.includes(tag) && <i className="ri-check-line" style={{ fontSize: 11, marginRight: 2 }}></i>}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="review-form-label">
              Tell us more
              <span className="review-form-sub">(optional)</span>
            </div>
            <textarea
              className="review-textarea"
              placeholder="Describe your experience — what did you love? What could be improved?"
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, 500))}
              rows={4}
            />
            <div className="review-char-count">{comment.length} / 500</div>
          </div>

          {/* Anonymous + submit */}
          <div className="review-form-foot">
            <div className="review-anon" onClick={() => setAnon(v => !v)}>
              <div className={cx('review-anon-check', anon && 'review-anon-check--on')}>
                {anon && <i className="ri-check-line" style={{ fontSize: 11 }}></i>}
              </div>
              <span className="review-anon-text">Post anonymously</span>
            </div>
            <Btn
              onClick={handleSubmit}
              disabled={rating === 0}
              title={rating === 0 ? 'Please select a rating first' : 'Submit review'}
            >
              Submit review <i className="ri-send-plane-line"></i>
            </Btn>
          </div>

        </div>
      </div>
    </div>
  );
}

window.ReviewPage = ReviewPage;
