import { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaServer } from 'react-icons/fa';

const SOURCES = [
  { name: 'Server 1 (VidNest)', url: (id) => `https://vidnest.fun/movie/${id}` },
  { name: 'Server 2 (VidLink)', url: (id) => `https://vidlink.pro/movie/${id}?primaryColor=c45454&secondaryColor=a2a2a2&iconColor=eefdec&poster=true&title=true&nextbutton=false&player=jw&autoplay=false` },
  { name: 'Server 3 (VidSrc.cc)', url: (id) => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false` },
  { name: 'Server 4 (VidSrc RU)', url: (id) => `https://vidsrc-embed.ru/embed/movie/${id}?autoPlay=false` },
  { name: 'Server 5 (Super)', url: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1&autoPlay=false` },
];

const VideoPlayer = ({ movieId }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [sourceIdx, setSourceIdx] = useState(0);

    // Powerful Anti-Ad Interception Script
    useEffect(() => {
        // 1. Hijack the parent window's open mechanism to catch ad scripts escaping the frame
        const originalOpen = window.open;
        window.open = function (url, name, specs) {
            console.warn("Shield Active: Blocked unauthorized popup attempt to:", url);
            return null; // Tricking the ad script into thinking it succeeded while doing nothing
        };

        // 2. Kill "Frame Busting" (Stops the iframe from forcefully redirecting your main website)
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Prevented malicious tracking redirection.';
            return e.returnValue;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup defense listeners when switching sources or unmounting component
        return () => {
            window.open = originalOpen;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [movieId, sourceIdx]);

    useEffect(() => {
        setShouldRender(false);
        const timer = setTimeout(() => setShouldRender(true), 150);
        return () => clearTimeout(timer);
    }, [movieId, sourceIdx]);

    if (!movieId) return null;

    const iframeSrc = SOURCES[sourceIdx].url(movieId);

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-1">
                <FaServer className="text-gray-400 text-sm mr-1" />
                <span className="text-sm text-gray-400 font-medium mr-2">Source:</span>
                {SOURCES.map((src, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSourceIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            sourceIdx === idx 
                                ? 'bg-red-600 text-white shadow-md' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {src.name}
                    </button>
                ))}
            </div>

            {/* Player */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg transform-gpu will-change-transform">
                {shouldRender && (
                    <iframe
                      key={iframeSrc}
                      src={iframeSrc}
                      /* We implement a Stealth Sandbox layout. 
                        By including 'allow-scripts' and 'allow-same-origin', the stream provider's internal
                        checks will think the environment is un-sandboxed and load normally. 
                        However, by strictly omitting 'allow-top-navigation-by-user-activation', we block 
                        them from breaking out and hijacking your main webpage layout.
                      */
                      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
                      allow="fullscreen *; picture-in-picture *; encrypted-media *; screen-wake-lock *;"
                      allowFullScreen
                      webkitallowfullscreen="true"
                      mozallowfullscreen="true"
                      title="Movie Stream"
                      referrerPolicy="origin"
                      className="absolute inset-0 w-full h-full border-0 transform-gpu"
                      style={{ userSelect: 'none' }}
                  />
                )}
            </div>
        </div>
    );
};

VideoPlayer.propTypes = {
    movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
};

export default memo(VideoPlayer);
