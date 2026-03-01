import { Link } from 'react-router-dom';
import API_BASE_URL from '../../apiConfig';

const FeedItem = ({ item }) => {
  const isLost = item.type === 'lost';

  // Clean up the image path string from Multer to construct a valid URL
  let cleanPath = item.imagePath ? item.imagePath.replace(/\\/g, '/') : '';

  // Return the direct Cloudinary absolute URL if present, otherwise fallback to standard local URL logic for legacy posts
  const imageUrl = cleanPath.startsWith('http')
    ? cleanPath
    : (cleanPath ? `${API_BASE_URL}/${cleanPath.startsWith('public/') ? cleanPath.replace('public/', '') : cleanPath}` : '');

  const formattedDate = new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <Link to={`/item/${item._id}`} className="group relative block bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Type Badge */}
      <div className={`absolute top-4 right-4 z-10 px-4 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border ${isLost
        ? 'bg-zinc-800/80 border-zinc-500 text-white shadow-zinc-500/30'
        : 'bg-zinc-200/90 border-zinc-100 text-black shadow-white/30'
        }`}>
        {isLost ? 'LOST' : 'FOUND'}
      </div>

      {item.status === 'resolved' && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-white text-black font-black text-2xl px-6 py-2 rounded-lg transform -rotate-12 outline outline-2 outline-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {isLost ? "RECOVERED" : "RETURNED"}
          </span>
        </div>
      )}

      {/* Image Area */}
      <div className="h-64 w-full overflow-hidden bg-black/50 relative flex-shrink-0">
        {item.imagePath ? (
          <img
            src={imageUrl}
            alt="Item"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=400&h=300'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-gray-200 leading-relaxed font-medium mb-4 flex-grow line-clamp-4">
          {item.description}
        </p>

        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
          <span className="flex items-center gap-2">
            🕒 {formattedDate}
          </span>
          <div className="flex items-center gap-3">
            {item.createdBy?.points >= 100 && (
              <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded text-xs font-bold" title="Top Finder">
                🏆 {item.createdBy?.points} PTS
              </span>
            )}
            <span className="font-semibold group-hover:underline text-white">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeedItem;
