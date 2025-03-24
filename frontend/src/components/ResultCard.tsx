import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ResultCardProps = {
  result: {
    prediction: string;
    scores: Record<string, number>;
    binary_prediction?: string;
  };
  headline: string;
};

const ResultCard = ({ result, headline }: ResultCardProps) => {
  // Function to get display info based on the truthfulness level
  const getTruthfulnessInfo = (prediction: string) => {
    switch(prediction) {
      case 'pants-fire':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          label: 'PANTS ON FIRE!',
          color: 'text-red-600',
          bgColor: 'bg-red-600',
          description: 'This claim is not only false but also ridiculous or absurd.'
        };
      case 'false':
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          label: 'FALSE',
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          description: 'This claim is not accurate.'
        };
      case 'barely-true':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
          label: 'BARELY TRUE',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500',
          description: 'This claim contains some element of truth but ignores critical facts.'
        };
      case 'half-true':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          label: 'HALF TRUE',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          description: 'This claim is partially accurate but leaves out important details.'
        };
      case 'mostly-true':
        return {
          icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
          label: 'MOSTLY TRUE',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500',
          description: 'This claim is accurate but needs clarification or additional information.'
        };
      case 'true':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          label: 'TRUE',
          color: 'text-green-600',
          bgColor: 'bg-green-600',
          description: 'This claim is accurate and there's nothing significant missing.'
        };
      default:
        // Fallback for binary classification or unknown categories
        if (result.binary_prediction === 'real') {
          return {
            icon: <CheckCircle className="h-6 w-6 text-truth" />,
            label: 'LOOKING REAL',
            color: 'text-truth',
            bgColor: 'bg-truth',
            description: 'This news appears to be factually accurate.'
          };
        } else {
          return {
            icon: <XCircle className="h-6 w-6 text-falsehood" />,
            label: 'LOOKING FAKE',
            color: 'text-falsehood',
            bgColor: 'bg-falsehood',
            description: 'This news appears to contain false information.'
          };
        }
    }
  };

  const truthInfo = getTruthfulnessInfo(result.prediction);
  
  // Calculate the highest score for confidence display
  const maxScore = Math.max(...Object.values(result.scores).map(score => Math.abs(score)));
  const confidence = Math.min(Math.round(Math.abs(maxScore) * 100), 100);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            {truthInfo.icon}
            <h3 className={`text-xl font-bold ${truthInfo.color}`}>
              {truthInfo.label}
            </h3>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Confidence: {confidence}%
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">Headline analyzed:</div>
          <div className="p-3 bg-background/40 rounded-md border border-border text-foreground">
            "{headline}"
          </div>
        </div>

        <div className="space-y-4">
          {/* Truthfulness scale visualization */}
          <div className="p-4 rounded-md bg-background/40 border border-border">
            <h4 className="text-sm font-medium mb-3">Truthfulness Rating:</h4>
            <div className="grid grid-cols-6 gap-1 mb-1">
              {['pants-fire', 'false', 'barely-true', 'half-true', 'mostly-true', 'true'].map(category => (
                <div 
                  key={category}
                  className={`h-2 rounded-full ${result.prediction === category ? 'opacity-100' : 'opacity-30'} ${
                    category === 'pants-fire' ? 'bg-red-600' :
                    category === 'false' ? 'bg-red-500' :
                    category === 'barely-true' ? 'bg-orange-500' :
                    category === 'half-true' ? 'bg-yellow-500' :
                    category === 'mostly-true' ? 'bg-emerald-500' :
                    'bg-green-600'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-6 text-[10px] text-muted-foreground">
              <div>Pants-Fire</div>
              <div className="text-center">False</div>
              <div className="text-center">Barely True</div>
              <div className="text-center">Half True</div>
              <div className="text-center">Mostly True</div>
              <div className="text-right">True</div>
            </div>
          </div>

          {/* Individual class scores */}
          <div className="p-4 rounded-md bg-background/40 border border-border">
            <h4 className="text-sm font-medium mb-3">Category Scores:</h4>
            <div className="space-y-2">
              {Object.entries(result.scores).map(([category, score]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{category.replace(/-/g, ' ')}</span>
                    <span>{Math.abs(score).toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={Math.min(Math.abs(score) * 100, 100)} 
                    className={`h-1.5 ${
                      category === 'pants-fire' ? 'bg-red-600' :
                      category === 'false' ? 'bg-red-500' :
                      category === 'barely-true' ? 'bg-orange-500' :
                      category === 'half-true' ? 'bg-yellow-500' :
                      category === 'mostly-true' ? 'bg-emerald-500' :
                      category === 'true' ? 'bg-green-600' :
                      'bg-gray-300'
                    }`} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-md bg-background/40 border border-border">
            <h4 className="text-sm font-medium mb-2">Analysis:</h4>
            <p className="text-sm text-muted-foreground">{truthInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-background/60 px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Our AI-powered analysis provides a detailed truthfulness rating based on the LIAR dataset classification system. Results include 6 classes ranging from "Pants on Fire" (completely false) to "True" (completely accurate).
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
