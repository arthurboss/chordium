import React from 'react';
import { useTranslation } from 'react-i18next';
import { Guitar, Music, Music2, Music3 } from 'lucide-react';

interface LoadingStateProps {
  /** Already-translated text. Falls back to the generic "Loading..." string if omitted. */
  message?: string;
}
/**
 * LoadingState component to display a loading animation with optional message.
 * @param {LoadingStateProps} props - Component properties.
 * @param {string} [props.message] - Optional message to display during loading.
 * @returns {JSX.Element} The rendered component.
 */
const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="p-8 text-center">
      <div className="flex items-center justify-center gap-2">
        {[
          { Icon: Guitar, size: 32 },
          { Icon: Music3, size: 24 },
          { Icon: Music, size: 24 },
          { Icon: Music2, size: 24 },
        ].map(({ Icon, size }, index) => (
          <div
            key={`icon-${size}-${index}`}
            className="animate-bounce"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <Icon
              size={size}
              className="text-chord opacity-80"
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        {message || t('errors:loading')}
      </p>
    </div>
  );
};

export default LoadingState;