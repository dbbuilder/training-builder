'use client';

import { useState } from 'react';
import type { AIModel } from '@/types';

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
  disabled?: boolean;
}

const MODEL_INFO = {
  'claude-haiku-3.5': {
    name: 'Claude Haiku 3.5',
    provider: 'Anthropic',
    description: 'Fast, efficient, great quality',
    cost: '~$3/course',
    speed: 'Very Fast',
    quality: 'Excellent',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500',
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Latest efficient model',
    cost: '~$2/course',
    speed: 'Fast',
    quality: 'Excellent',
    icon: '🧠',
    color: 'from-green-500 to-teal-500',
  },
  'gemini-flash-2.0': {
    name: 'Gemini Flash 2.0',
    provider: 'Google',
    description: 'Fast multimodal model',
    cost: '~$2/course',
    speed: 'Very Fast',
    quality: 'Very Good',
    icon: '⚡',
    color: 'from-blue-500 to-indigo-500',
  },
};

export default function ModelSelector({ value, onChange, disabled = false }: ModelSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select AI Model</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(MODEL_INFO) as AIModel[]).map((modelId) => {
          const model = MODEL_INFO[modelId];
          const isSelected = value === modelId;

          return (
            <button
              key={modelId}
              onClick={() => !disabled && onChange(modelId)}
              disabled={disabled}
              className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${model.color} mb-4`}
              >
                <span className="text-2xl">{model.icon}</span>
              </div>

              {/* Model Name */}
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{model.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{model.description}</p>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium text-gray-900">{model.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium text-gray-900">{model.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium text-gray-900">{model.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Cost:</span>
                  <span className="font-semibold text-blue-600">{model.cost}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
