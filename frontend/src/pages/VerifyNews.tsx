import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import VerificationForm from '@/components/VerificationForm';
import ResultCard from '@/components/ResultCard';
import { ArrowRight } from 'lucide-react';
import { predictNews } from "@/services/api";

type TruthfulnessResult = {
  prediction: string;
  scores: Record<string, number>;
  binary_prediction: string;
};

const VerifyNews = () => {
  const [result, setResult] = useState<TruthfulnessResult | null>(null);
  const [headline, setHeadline] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle form submission
  const handleNewsVerification = async (newsText: string) => {
    setHeadline(newsText);
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await predictNews(newsText);
      setResult(result);
    } catch (error) {
      setError("Error analyzing news. Please try again later.");
      console.error("Error analyzing news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animate sections when they come into view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => {
      observer.observe(el);
    });

    return () => {
      elements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-60 h-60 bg-accent/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex gap-2 px-4 py-2 glass rounded-full mb-6 animate-fade-in">
              <span className="text-sm font-medium text-muted-foreground">AI-Powered Analysis</span>
            </div>
            <h1 className="h2 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Verify News Headlines in Seconds
            </h1>
            <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Enter any news headline below and our advanced AI will analyze its truthfulness level, from "Pants on Fire" false to completely "True".
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <VerificationForm onSubmit={handleNewsVerification} />
            
            {isLoading && (
              <div className="mt-8 p-6 glass rounded-xl animate-fade-in text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-muted-foreground">Analyzing headline...</p>
              </div>
            )}
            
            {!isLoading && result && (
              <div className="mt-8 animate-fade-in">
                <ResultCard result={result} headline={headline} />
              </div>
            )}
            
            {!isLoading && error && (
              <div className="mt-8 p-4 bg-red-100 text-red-800 rounded-lg animate-fade-in">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Truthfulness Scale Section */}
      <section className="py-16 bg-muted/10">
        <div className="container-custom">
          <div className="text-center mb-12 opacity-0 animate-on-scroll">
            <h2 className="h3 mb-4">Understanding the Truthfulness Scale</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our analysis uses a 6-level classification system from the LIAR dataset to provide nuanced credibility assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Pants on Fire",
                color: "bg-red-600",
                textColor: "text-red-600",
                description: "The claim is not only false but ridiculously false"
              },
              {
                label: "False",
                color: "bg-red-500",
                textColor: "text-red-500",
                description: "The statement is not accurate"
              },
              {
                label: "Barely True",
                color: "bg-orange-500",
                textColor: "text-orange-500",
                description: "Elements of truth but ignores critical facts"
              },
              {
                label: "Half True",
                color: "bg-yellow-500", 
                textColor: "text-yellow-500",
                description: "Partially accurate but leaves out important details"
              },
              {
                label: "Mostly True",
                color: "bg-emerald-500",
                textColor: "text-emerald-500",
                description: "Accurate but needs clarification or context"
              },
              {
                label: "True",
                color: "bg-green-600",
                textColor: "text-green-600",
                description: "The statement is accurate and nothing significant is missing"
              }
            ].map((level, index) => (
              <div key={index} className="glass glass-hover p-5 rounded-xl opacity-0 animate-on-scroll">
                <div className="flex items-start gap-3">
                  <div className={`${level.color} w-3 h-3 rounded-full shrink-0 mt-1.5`}></div>
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${level.textColor}`}>{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-muted/20">
        <div className="container-custom">
          <div className="text-center mb-12 opacity-0 animate-on-scroll">
            <h2 className="h3 mb-4">Tips for Recognizing Fake News</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              While our AI can help identify potential misinformation, developing your own critical thinking skills is essential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Check the Source",
                description: "Verify that the news comes from a reputable publication with editorial standards and fact-checking processes."
              },
              {
                title: "Look for Multiple Sources",
                description: "If a story is true, multiple credible outlets will typically report it with consistent core facts."
              },
              {
                title: "Beware of Emotional Language",
                description: "Fake news often uses emotionally charged language to trigger reactions rather than inform."
              },
              {
                title: "Check the Date",
                description: "Old stories may be recirculated out of context. Always verify when the story was published."
              }
            ].map((tip, index) => (
              <div key={index} className="glass glass-hover p-6 rounded-xl opacity-0 animate-on-scroll">
                <div className="flex items-start gap-4">
                  <div className="glass flex items-center justify-center w-8 h-8 rounded-full shrink-0">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
                    <p className="text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-10">
        <div className="container-custom">
          <div className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TruthLens. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerifyNews;
