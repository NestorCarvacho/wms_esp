import React, { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';


interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabListProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab || (tabs.length > 0 ? tabs[0].id : ''),
  );

  // Sync internal state when defaultActiveTab prop changes
  useEffect(() => {
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const getActiveTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab?.content || null;
  };

  return (
    <div className={className}>
      <ul 
        role="tablist" 
        className="flex justify-center mb-6"
        style={{ borderBottom: `1px solid ${colors.grays.neutralE5}` }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <li key={tab.id} role="presentation" className="mr-8">
              <button
                role="tab"
                aria-selected={isActive}
                className="pb-3 transition-colors duration-200"
                style={{
                  borderBottom: `2px solid ${
                    isActive 
                      ? colors.important.main 
                      : 'transparent'
                  }`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderBottomColor = colors.grays.neutralCC;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
                onClick={() => handleTabClick(tab.id)}
              >
                <Text
                  variant="body-regular"
                  color={isActive ? colors.important.main : colors.primary.dash}
                  style={{
                    fontWeight: isActive ? 500 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </Text>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Tab Content */}
      <div role="tabpanel" className="tab-content">
        {getActiveTabContent()}
      </div>
    </div>
  );
};

export default TabList;
