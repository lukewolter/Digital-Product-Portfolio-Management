import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Trash2, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  voters: string[];
  comments: Array<{ id: string; user: string; text: string; created_at: string }>;
  created_by: string;
  created_at: string;
}

interface IdeasPortalTabProps {
  portfolioId: string;
}

export default function IdeasPortalTab({ portfolioId }: IdeasPortalTabProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'Feature Request',
    created_by: 'user@example.com'
  });
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [newComment, setNewComment] = useState('');

  const categories = ['Feature Request', 'Bug Report', 'Improvement', 'Integration', 'Other'];
  const statuses = ['Submitted', 'Under Review', 'Planned', 'In Progress', 'Completed', 'Rejected'];

  useEffect(() => {
    loadIdeas();
  }, [portfolioId, filterCategory, filterStatus]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const cat = filterCategory === 'all' ? '' : filterCategory;
      const stat = filterStatus === 'all' ? '' : filterStatus;
      const data = await apiClient.getIdeas(portfolioId, cat, stat) as Idea[];
      setIdeas(data);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async () => {
    if (!newIdea.title.trim()) return;
    
    try {
      await apiClient.createIdea(portfolioId, newIdea);
      setNewIdea({ title: '', description: '', category: 'Feature Request', created_by: 'user@example.com' });
      setShowForm(false);
      loadIdeas();
    } catch (error) {
      console.error('Failed to create idea:', error);
    }
  };

  const handleVote = async (ideaId: string, hasVoted: boolean) => {
    try {
      if (hasVoted) {
        await apiClient.unvoteIdea(ideaId, 'user@example.com');
      } else {
        await apiClient.voteIdea(ideaId, 'user@example.com');
      }
      loadIdeas();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleAddComment = async (ideaId: string) => {
    if (!newComment.trim()) return;
    
    try {
      await apiClient.addIdeaComment(ideaId, {
        user: 'user@example.com',
        text: newComment
      });
      setNewComment('');
      loadIdeas();
      const updated = await apiClient.getIdea(ideaId) as Idea;
      setSelectedIdea(updated);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handlePromoteIdea = async (ideaId: string) => {
    try {
      await apiClient.promoteIdea(ideaId);
      loadIdeas();
      alert('Idea promoted to roadmap milestone!');
    } catch (error) {
      console.error('Failed to promote idea:', error);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Delete this idea?')) return;
    
    try {
      await apiClient.deleteIdea(ideaId);
      loadIdeas();
      setSelectedIdea(null);
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ideas Portal</h2>
          <p className="text-gray-600">Collect and prioritize customer feedback</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Submit New Idea'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Brief title for your idea"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Describe your idea in detail"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={newIdea.category} onValueChange={(value) => setNewIdea({ ...newIdea, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateIdea} className="w-full">Submit Idea</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading ideas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea) => {
            const hasVoted = idea.voters.includes('user@example.com');
            return (
              <Card key={idea.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedIdea(idea)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription className="mt-2">{idea.description}</CardDescription>
                    </div>
                    <Badge variant={idea.status === 'Completed' ? 'default' : 'secondary'}>
                      {idea.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Button
                        variant={hasVoted ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id, hasVoted);
                        }}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {idea.votes}
                      </Button>
                      <div className="flex items-center text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {idea.comments.length}
                      </div>
                    </div>
                    <Badge variant="outline">{idea.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIdea && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedIdea.title}</CardTitle>
                <CardDescription className="mt-2">{selectedIdea.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePromoteIdea(selectedIdea.id)}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Promote to Roadmap
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteIdea(selectedIdea.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Comments ({selectedIdea.comments.length})</h3>
              <div className="space-y-2 mb-4">
                {selectedIdea.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{comment.user}</p>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedIdea.id)}
                />
                <Button onClick={() => handleAddComment(selectedIdea.id)}>Post</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
