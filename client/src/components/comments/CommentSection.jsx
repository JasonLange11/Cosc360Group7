import { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useAuth } from '../../context/AuthContext'
import { createComment, deleteComment, getComments } from '../../lib/commentsApi'
import { createFlag } from '../../lib/flagsApi.js'
import './css/CommentSection.css'

export default function CommentSection({ parentType, parentId, pageSize = 5 }) {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [flagBusyCommentId, setFlagBusyCommentId] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  useEffect(() => {
    setPage(1)
  }, [parentType, parentId])

  useEffect(() => {
    let isMounted = true

    async function loadComments() {
      if (!parentType || !parentId) {
        return
      }

      try {
        setLoading(true)
        const data = await getComments({ parentType, parentId, page, limit: pageSize })

        if (!isMounted) {
          return
        }

        setItems(Array.isArray(data?.items) ? data.items : [])
        setTotal(Number.isFinite(data?.total) ? data.total : 0)
        setError('')
      } catch (err) {
        if (!isMounted) {
          return
        }

        setError(err.message || 'Failed to load comments')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      isMounted = false
    }
  }, [parentType, parentId, page, pageSize])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!currentUser) {
      setError('You must be logged in to post a comment')
      return
    }

    const content = newComment.trim()

    if (!content) {
      setError('Please enter a comment')
      return
    }

    try {
      setSubmitting(true)
      await createComment({ parentType, parentId, content })
      setNewComment('')
      setPage(1)

      const data = await getComments({ parentType, parentId, page: 1, limit: pageSize })
      setItems(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number.isFinite(data?.total) ? data.total : 0)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)

      const nextTotal = Math.max(0, total - 1)
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize))
      const nextPage = Math.min(page, nextTotalPages)

      const data = await getComments({ parentType, parentId, page: nextPage, limit: pageSize })
      setItems(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number.isFinite(data?.total) ? data.total : 0)
      setPage(nextPage)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to delete comment')
    }
  }

  const canDeleteComment = (comment) => {
    if (!currentUser) {
      return false
    }

    return currentUser.isAdmin || String(comment.userId || '') === String(currentUser.id || '')
  }

  const canFlagComment = (comment) => {
    if (!currentUser) {
      return false
    }

    return String(comment.userId || '') !== String(currentUser.id || '')
  }

  const handleFlag = async (commentId) => {
    const reason = window.prompt('Optional reason for flagging this comment:') || ''

    try {
      setFlagBusyCommentId(commentId)
      setError('')
      await createFlag({ targetType: 'comment', targetId: commentId, reason })
    } catch (err) {
      setError(err.message || 'Failed to flag comment')
    } finally {
      setFlagBusyCommentId('')
    }
  }

  return (
    <section className="comment-section">
      <h3 className="comment-section-title">Comments</h3>

      {loading ? <p className="comment-empty">Loading comments...</p> : null}

      {!loading && items.length === 0 ? (
        <p className="comment-empty">No comments yet.</p>
      ) : null}

      <ul className="comment-list">
        {items.map((comment) => (
          <li key={comment._id} className="comment-item">
            <div className="comment-meta">
              <strong>{comment.username || 'Anonymous'}</strong>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p className="comment-content">{comment.content}</p>
            {canDeleteComment(comment) ? (
              <button
                type="button"
                className="comment-delete"
                onClick={() => handleDelete(comment._id)}
              >
                Delete
              </button>
            ) : null}
            {canFlagComment(comment) ? (
              <button
                type="button"
                className="comment-delete"
                onClick={() => handleFlag(comment._id)}
                disabled={flagBusyCommentId === comment._id}
                title="Flag comment"
                aria-label="Flag comment"
              >
                <i className={`fa-regular ${flagBusyCommentId === comment._id ? 'fa-hourglass-half' : 'fa-flag'}`}></i>
                {flagBusyCommentId === comment._id ? ' Flagging...' : ' Flag'}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="comment-pagination">
        <button type="button" onClick={() => setPage((prev) => prev - 1)} disabled={!canGoPrev}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => setPage((prev) => prev + 1)} disabled={!canGoNext}>
          Next
        </button>
      </div>

      {error ? <p className="comment-error">{error}</p> : null}

      {currentUser ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-input"
            rows={3}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Write a comment..."
          />
          <button className="comment-submit" type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="comment-login-prompt">
          <a href="/login">Log in</a> to leave a comment.
        </p>
      )}
    </section>
  )
}
