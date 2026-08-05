import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { FiCalendar, FiPlus, FiTrash2, FiEdit2, FiAlertCircle, FiCheckCircle, FiClock, FiMapPin, FiUpload } from 'react-icons/fi';
import { UPCOMING_EVENTS } from '../../data/eventsData';

export default function EventsPortal({ userRole }) {
  const role = userRole || 'admin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false); // false = listing, true = form
  const [editingId, setEditingId] = useState(null); // null = new event, string = editing event id
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [tag, setTag] = useState('General');
  const [route, setRoute] = useState('');
  const [folder, setFolder] = useState('');
  const [status, setStatus] = useState('upcoming'); // upcoming | archived

  // Access control check
  const hasAccess = role === 'admin' || role === 'oops' || role === 'member';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiClient.get('/api/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events from backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setVenue('');
    setDesc('');
    setImg('/img/event-banner.png');
    setTag('General');
    setRoute('');
    setFolder('');
    setStatus('upcoming');
    setIsEditing(true);
  };

  const handleOpenEditForm = (evt) => {
    setEditingId(evt.id);
    setTitle(evt.title);
    setDate(evt.date);
    setVenue(evt.venue);
    setDesc(evt.desc || '');
    setImg(evt.img || '/img/event-banner.png');
    setTag(evt.tag || 'General');
    setRoute(evt.route || '');
    setFolder(evt.folder || '');
    setStatus(evt.status || 'upcoming');
    setIsEditing(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.delete(`/api/events/${id}`);
      setSuccess('Event card deleted successfully.');
      loadEvents();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete event card.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !venue || !desc) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Generate safe route and folder slug if empty
    const generatedId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalRoute = route || `/events/${title.replace(/[^a-zA-Z0-9]/g, '')}`;
    const finalFolder = folder || generatedId;

    const payload = {
      title,
      date,
      venue,
      desc,
      img: img || '/img/event-banner.png',
      tag,
      route: finalRoute,
      folder: finalFolder,
      status
    };



    try {
      if (editingId) {
        await apiClient.put(`/api/events/${editingId}`, payload);
        setSuccess('Event card updated successfully.');
      } else {
        await apiClient.post('/api/events', payload);
        setSuccess('New event card launched successfully.');
      }
      setIsEditing(false);
      loadEvents();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save event card.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="bg-red-50/50 p-6 rounded-3xl border border-red-200/50 text-red-700 flex items-center gap-3">
        <FiAlertCircle size={20} className="flex-shrink-0" />
        <div>
          <h3 className="font-extrabold text-sm uppercase">Access Denied</h3>
          <p className="text-xs mt-0.5">Only Admins, Oops, or Core Members are authorized to launch or manage events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Event Dashboard
          </h2>
          <p className="text-neutral-500 mt-1">Add, update, or remove event cards on the main website dynamically.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus size={14} /> Launch Event Card
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-xl text-red-600 bg-red-50 border border-red-200">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-xl text-green-700 bg-green-50 border border-green-200">
          <FiCheckCircle size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {isEditing ? (
        /* Event Edit Form Card */
        <div className="bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-lg font-bold text-neutral-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {editingId ? 'Edit Event Card' : 'Launch New Event Card'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading || !!editingId}
                  required
                  placeholder="e.g. Cydropreneur"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Event Date *</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  placeholder="e.g. 15th March, 2026"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Venue *</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  placeholder="e.g. UEM Kolkata Campus"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Tag / Category</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. General, Seminar, Workshop"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Route Slug (Optional)</label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. /events/cydropreneur"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Folder Slug (Optional)</label>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="e.g. cydropreneur"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Image URL (Banner)</label>
                <input
                  type="text"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  placeholder="/img/event-banner.png"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-xl border border-neutral-200 bg-white py-2 px-3 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Event Description *</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                rows={4}
                placeholder="Write a brief overview of the event..."
                className="block w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all rounded-xl"
              >
                {loading ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Event Cards Grid Listing */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-500 italic text-xs">
              No event cards found. Click "Launch Event Card" to create one.
            </div>
          ) : (
            events.map(evt => (
              <div
                key={evt.id}
                className="group relative bg-white/50 backdrop-blur-md rounded-3xl border border-white/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01] duration-300"
              >
                <div>
                  <div className="h-40 w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      src={evt.img || '/img/event-banner.png'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/img/event-banner.png';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-neutral-950/80 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2 rounded-full">
                      {evt.tag || 'General'}
                    </span>
                    <span className={`absolute top-3 right-3 font-bold text-[9px] uppercase tracking-wider py-1 px-2 rounded-full border shadow-sm ${
                      evt.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {evt.status || 'upcoming'}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <h3 className="font-extrabold text-neutral-800 text-lg leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {evt.title}
                    </h3>
                    <p className="text-neutral-500 text-xs line-clamp-3 leading-relaxed">
                      {evt.desc || 'No description provided.'}
                    </p>

                    <div className="pt-2 text-[10px] text-neutral-500 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FiCalendar className="text-neutral-400" /> {evt.date}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <FiMapPin className="text-neutral-400" /> {evt.venue}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex justify-end gap-2 border-t border-neutral-100/60 mt-2">
                  <button
                    onClick={() => handleOpenEditForm(evt)}
                    className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 hover:text-neutral-800 transition-all"
                    title="Edit Card"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-neutral-400 hover:text-red-600 transition-all"
                    title="Delete Card"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
