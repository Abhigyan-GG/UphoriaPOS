"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/logo';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [email, setEmail] = useState('staff@example.com');
  const [password, setPassword] = useState('password');
  const [displayName, setDisplayName] = useState('Staff');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);

    try {
      if (isSignUp) {
        // Handle Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });
        await setDoc(doc(firestore, "users", user.uid), {
            displayName: displayName,
            email: user.email,
            photoURL: user.photoURL,
        });
      } else {
        // Handle Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Authentication failed", error);
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm z-0"></div>
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
        style={{backgroundImage: "url('https://picsum.photos/seed/posbg/1920/1080')", backgroundBlendMode: 'overlay'}}
        data-ai-hint="abstract pattern"
      ></div>
      
      <Card className="w-full max-w-sm z-10 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="font-headline text-3xl">{isSignUp ? 'Create Account' : 'Staff Access'}</CardTitle>
            <CardDescription>{isSignUp ? 'Create an account to get started.' : 'Log in to manage sales and inventory.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" type="text" placeholder="Your Name" required value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="staff@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? (isSignUp ? 'Creating Account...' : 'Entering...') : (isSignUp ? 'Sign Up' : 'Enter POS')}
            </Button>
            <Button type="button" variant="link" size="sm" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
