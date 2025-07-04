import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EncryptionUtils } from '@/utils/encryption';

interface PromptFormProps {
  prompt?: Prompt;
  onSave: () => void;
  onCancel: () => void;
}

export const PromptForm = ({ prompt, onSave, onCancel }: PromptFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    encryptionPassword: '',
    useEncryption: false,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        description: prompt.description || '',
        content: prompt.content,
        tags: prompt.tags?.join(', ') || '',
        encryptionPassword: '',
        useEncryption: !!prompt.encrypted_content,
      });
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let encryptedContent = null;
      
      if (formData.useEncryption && formData.encryptionPassword) {
        encryptedContent = await EncryptionUtils.encrypt(
          formData.content,
          formData.encryptionPassword
        );
      }

      const promptData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim(),
        encrypted_content: encryptedContent,
        tags: formData.tags.trim() 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : null,
        created_by: user.id,
      };

      if (prompt) {
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', prompt.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Prompt updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert([promptData]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Prompt created successfully',
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${prompt ? 'update' : 'create'} prompt: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{prompt ? 'Edit Prompt' : 'Create New Prompt'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter prompt title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your prompt content here..."
              className="min-h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useEncryption"
                checked={formData.useEncryption}
                onChange={(e) => setFormData({ ...formData, useEncryption: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="useEncryption">Enable encryption</Label>
            </div>
            
            {formData.useEncryption && (
              <div className="space-y-2">
                <Label htmlFor="encryptionPassword">Encryption Password</Label>
                <Input
                  id="encryptionPassword"
                  type="password"
                  value={formData.encryptionPassword}
                  onChange={(e) => setFormData({ ...formData, encryptionPassword: e.target.value })}
                  placeholder="Enter encryption password"
                  required={formData.useEncryption}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : prompt ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};