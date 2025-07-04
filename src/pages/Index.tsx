import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PromptList } from '@/components/PromptList';
import { PromptForm } from '@/components/PromptForm';
import { PromptViewer } from '@/components/PromptViewer';
import { Prompt } from '@/types/database';
import { LogOut, Shield, Eye } from 'lucide-react';

const Index = () => {
  const { user, profile, signOut, loading, isAdmin } = useAuth();
  const [view, setView] = useState<'list' | 'form' | 'view'>('list');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setView('form');
  };

  const handleView = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setView('view');
  };

  const handleCreateNew = () => {
    setSelectedPrompt(undefined);
    setView('form');
  };

  const handleSave = () => {
    setView('list');
    setSelectedPrompt(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedPrompt(undefined);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Prompt Manager</h1>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              <Shield className="h-3 w-3 mr-1" />
              {profile?.role === 'admin' ? 'Admin' : 'Read Only'}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {view === 'list' && (
          <PromptList
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
            refreshTrigger={refreshTrigger}
          />
        )}

        {view === 'form' && (
          <PromptForm
            prompt={selectedPrompt}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {view === 'view' && selectedPrompt && (
          <PromptViewer
            prompt={selectedPrompt}
            onClose={handleCancel}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
