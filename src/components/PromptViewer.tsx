import { useState } from 'react';
import { Prompt } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EncryptionUtils } from '@/utils/encryption';
import { Copy, Eye, EyeOff } from 'lucide-react';

interface PromptViewerProps {
  prompt: Prompt;
  onClose: () => void;
}

export const PromptViewer = ({ prompt, onClose }: PromptViewerProps) => {
  const [decryptionPassword, setDecryptionPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const { toast } = useToast();

  const handleDecrypt = async () => {
    if (!prompt.encrypted_content || !decryptionPassword) return;

    setDecrypting(true);
    try {
      const decrypted = await EncryptionUtils.decrypt(
        prompt.encrypted_content,
        decryptionPassword
      );
      setDecryptedContent(decrypted);
      setShowDecrypted(true);
      toast({
        title: 'Success',
        description: 'Content decrypted successfully',
      });
    } catch (error) {
      toast({
        title: 'Decryption Failed',
        description: 'Invalid password or corrupted data',
        variant: 'destructive',
      });
    } finally {
      setDecrypting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const displayContent = showDecrypted ? decryptedContent : prompt.content;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{prompt.title}</CardTitle>
            {prompt.description && (
              <p className="text-muted-foreground mt-1">{prompt.description}</p>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {prompt.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {prompt.encrypted_content && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label htmlFor="decryptPassword">
              This content is encrypted. Enter password to decrypt:
            </Label>
            <div className="flex gap-2">
              <Input
                id="decryptPassword"
                type="password"
                value={decryptionPassword}
                onChange={(e) => setDecryptionPassword(e.target.value)}
                placeholder="Enter decryption password"
              />
              <Button 
                onClick={handleDecrypt} 
                disabled={!decryptionPassword || decrypting}
              >
                {decrypting ? 'Decrypting...' : 'Decrypt'}
              </Button>
            </div>
            {showDecrypted && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Eye className="h-4 w-4" />
                Content decrypted and visible below
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Content</Label>
            <div className="flex gap-2">
              {prompt.encrypted_content && showDecrypted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDecrypted(false);
                    setDecryptedContent('');
                    setDecryptionPassword('');
                  }}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Decrypted
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(displayContent)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{displayContent}</pre>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Created: {new Date(prompt.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(prompt.updated_at).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};