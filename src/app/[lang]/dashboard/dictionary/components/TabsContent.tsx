'use client';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FoundDefinitionsList } from './FoundDefinitionsList';
import { WebsiteLang } from '@api/types.model';
import { PaginatedResponse } from '@repository/types.model';
import { WordEntryForm } from '@/dashboard/dictionary/components/WordEntryForm';
import { SourceModelType, WordModelExistingNestedType } from '@/dashboard/models/proposal.model';
import DictionaryProposalsOverview from './DictionaryProposalsOverview';
import { useTranslation } from 'react-i18next';
import { Proposal } from '@repository/entities/Proposal';
import { FORM_ENTRY_STATE } from './WordEntryForm/constants';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const dictionaryTabs = ['published', 'add', 'my-proposals', 'review-proposals'] as const;
type DictionaryTab = (typeof dictionaryTabs)[number];

const tabParamToIndex = (tab: string | null) => {
  const index = dictionaryTabs.indexOf(tab as DictionaryTab);
  return index === -1 ? 0 : index;
};

const TabsContent: React.FC<{
  lang: WebsiteLang;
  paginatedWords: PaginatedResponse<WordModelExistingNestedType>;
  sourceModels: SourceModelType[];
  myProposals: PaginatedResponse<Proposal>;
  myProposalsHistory: PaginatedResponse<Proposal>;
  reviewProposals: PaginatedResponse<Proposal>;
  reviewProposalsHistory: PaginatedResponse<Proposal>;
  proposalBaselineWords: Record<number, Record<number, WordModelExistingNestedType>>;
}> = ({
  lang,
  paginatedWords,
  sourceModels,
  myProposals,
  myProposalsHistory,
  reviewProposals,
  reviewProposalsHistory,
  proposalBaselineWords,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // TODO: create page per tab, for optimized performance and workflow
  const value = tabParamToIndex(searchParams.get('tab'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = dictionaryTabs[newValue];
    if (tab === dictionaryTabs[0]) {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label={t('addNewWord.tabs.ariaLabel', { ns: 'dashboard' })}
        >
          <Tab label={t('addNewWord.tabs.publishedData', { ns: 'dashboard' })} {...a11yProps(0)} />
          <Tab label={t('addNewWord.tabs.addWords', { ns: 'dashboard' })} {...a11yProps(1)} />
          <Tab label={t('addNewWord.tabs.myProposals', { ns: 'dashboard' })} {...a11yProps(2)} />
          <Tab
            label={t('addNewWord.tabs.reviewProposals', { ns: 'dashboard' })}
            {...a11yProps(3)}
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <FoundDefinitionsList
          lang={lang}
          paginatedWords={paginatedWords}
          sourceModels={sourceModels}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <WordEntryForm
          lang={lang}
          sourceModels={sourceModels}
          formEntryState={FORM_ENTRY_STATE.NEW}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {/* Need to see here only proposals made by the user */}
        <DictionaryProposalsOverview
          proposals={myProposals}
          historyProposals={myProposalsHistory}
          lang={lang}
          sourceModels={sourceModels}
          readonly={true}
          baselineWords={proposalBaselineWords}
          queryParamPrefix="myProposals"
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('dictionaryReview.adminOnly', { ns: 'dashboard' })}
        </Typography>
        <DictionaryProposalsOverview
          proposals={reviewProposals}
          historyProposals={reviewProposalsHistory}
          lang={lang}
          sourceModels={sourceModels}
          readonly={false}
          baselineWords={proposalBaselineWords}
          queryParamPrefix="reviewProposals"
        />
      </CustomTabPanel>
    </Box>
  );
};

export default TabsContent;
