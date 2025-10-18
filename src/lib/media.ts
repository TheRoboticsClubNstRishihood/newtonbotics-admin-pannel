// Media API client for Gallery
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function safeParseJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  throw new Error(`Unexpected response (${response.status} ${response.statusText}): ${text.slice(0, 200)}`);
}

function toQuery(params: Record<string, string | number | boolean | null | undefined> = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    search.set(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const mediaService = {
  // GET /api/media - List all media files
  async listMedia({ 
    fileType, 
    categoryId, 
    q, 
    limit = 50, 
    skip = 0, 
    isFeatured 
  }: {
    fileType?: string;
    categoryId?: string;
    q?: string;
    limit?: number;
    skip?: number;
    isFeatured?: boolean;
  } = {}) {
    try {
      const query = toQuery({ fileType, categoryId, q, limit, skip, isFeatured });
      const res = await fetch(`${API_BASE_URL}/media${query}`, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await safeParseJson(res);
      if (data?.success === false) {
        const msg = data?.error?.message || data?.message || 'Failed to load media';
        throw new Error(msg);
      }
      
      return data?.data || { items: [], pagination: { total: 0, limit, skip, hasMore: false } };
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error(`Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // GET /api/media/categories - List media categories
  async listCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/media/categories`, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await safeParseJson(res);
      if (data?.success === false) {
        const msg = data?.error?.message || data?.message || 'Failed to load categories';
        throw new Error(msg);
      }
      
      return data?.data?.items || [];
    } catch (error) {
      console.error('Error fetching media categories:', error);
      throw new Error(`Failed to load categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // GET /api/media/collections - List media collections
  async listCollections() {
    try {
      const res = await fetch(`${API_BASE_URL}/media/collections`, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await safeParseJson(res);
      if (data?.success === false) {
        const msg = data?.error?.message || data?.message || 'Failed to load collections';
        throw new Error(msg);
      }
      
      return data?.data?.items || [];
    } catch (error) {
      console.error('Error fetching media collections:', error);
      throw new Error(`Failed to load collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // GET /api/media/:id - Get specific media item
  async getMedia(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/media/${id}`, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await safeParseJson(res);
      if (data?.success === false) {
        const msg = data?.error?.message || data?.message || 'Failed to load media item';
        throw new Error(msg);
      }
      
      return data?.data?.item;
    } catch (error) {
      console.error('Error fetching media item:', error);
      throw new Error(`Failed to load media item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Helper function to get file type icon
  getFileTypeIcon(fileType: string) {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  },

  // Helper function to format file size
  formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to format duration
  formatDuration(seconds: number) {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

export default mediaService;
