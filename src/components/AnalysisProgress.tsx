import { useEffect, useState } from 'react';

interface AnalysisProgressProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  onComplete?: () => void;
}

interface Step {
  id: number;
  label: string;
  subtext?: string;
  status: 'pending' | 'active' | 'completed';
}

export function AnalysisProgress({ status, onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'pending' },
    { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'pending' },
    { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'pending' },
    { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'pending' },
  ]);

  useEffect(() => {
    if (status !== 'loading') {
      setProgress(0);
      setCurrentStep(0);
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'pending' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'pending' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'pending' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'pending' },
      ]);
      return;
    }

    // Simulate progress - slow, linear
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.4; // Slower, more deliberate
      });
    }, 60);

    return () => clearInterval(progressInterval);
  }, [status]);

  // Update steps based on progress
  useEffect(() => {
    if (status !== 'loading') return;

    if (progress < 25) {
      setCurrentStep(0);
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'active' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'pending' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'pending' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'pending' },
      ]);
    } else if (progress < 50) {
      setCurrentStep(1);
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'completed' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'active' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'pending' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'pending' },
      ]);
    } else if (progress < 80) {
      setCurrentStep(2);
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'completed' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'completed' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'active' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'pending' },
      ]);
    } else {
      setCurrentStep(3);
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'completed' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'completed' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'completed' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'active' },
      ]);
    }
  }, [progress, status]);

  // Handle success
  useEffect(() => {
    if (status === 'success') {
      setSteps([
        { id: 1, label: 'Extracting transcript', subtext: 'Retrieving video data', status: 'completed' },
        { id: 2, label: 'Parsing video structure', subtext: 'Identifying key segments', status: 'completed' },
        { id: 3, label: 'Analyzing content', subtext: 'Processing transcript', status: 'completed' },
        { id: 4, label: 'Preparing insights', subtext: 'Generating analysis', status: 'completed' },
      ]);
      setProgress(100);

      const timeout = setTimeout(() => {
        onComplete?.();
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [status, onComplete]);

  if (status === 'idle' || status === 'error') return null;

  return (
    <div
      className={`transition-opacity duration-200 ease-in-out ${
        status === 'success' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mt-6 px-6 py-5 bg-white border border-gray-200 rounded-md shadow-sm">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-[15px] font-medium text-gray-800 mb-1">Analyzing content</h3>
          <p className="text-[13px] text-gray-500">Processing video transcript</p>
        </div>

        {/* Progress bar - full width, minimal */}
        <div className="relative h-1 bg-gray-100 rounded-sm overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-sm transition-all duration-200 ease-in-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              opacity: 0.65
            }}
          />
        </div>

        {/* Steps - left-aligned vertical stepper */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step indicator - minimal circle */}
              <div className="relative flex-shrink-0 pt-0.5">
                {step.status === 'completed' ? (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center" style={{ opacity: 0.65 }}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-4 h-4 border-2 border-blue-600 rounded-full" style={{ opacity: 0.65 }}>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full m-auto mt-0.5" />
                  </div>
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded-full" />
                )}

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-2 w-px h-5 transition-colors duration-200 ${
                      step.status === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{ opacity: step.status === 'completed' ? 0.65 : 1 }}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-normal transition-colors duration-150 ${
                  step.status === 'completed' ? 'text-gray-700' :
                  step.status === 'active' ? 'text-gray-900' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </div>
                {step.subtext && step.status === 'active' && (
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    {step.subtext}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
