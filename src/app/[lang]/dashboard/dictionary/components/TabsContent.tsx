'use client';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PublicIcon from '@mui/icons-material/Public';
import { FoundDefinitionsList } from './FoundDefinitionsList';
import { WebsiteLang } from '@api/types.model';
import { PaginatedResponse } from '@repository/types.model';
import { Word } from '@repository/entities/Word';
import { WordEntryForm } from '@/dashboard/dictionary/components/WordEntryForm';
import {
  DictionaryProposalModel,
  SourceModelType,
  WordModelExistingNestedType,
  WordModelNestedType,
} from '@/dashboard/models/proposal.model';
import DictionaryProposalsOverview from './DictionaryProposalsOverview';
import { useTranslation } from 'react-i18next';
import { Proposal } from '@repository/entities/Proposal';

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

const TabsContent: React.FC<{
  lang: WebsiteLang;
  paginatedWords: PaginatedResponse<WordModelExistingNestedType>;
  sourceModels: SourceModelType[];
  proposals: Proposal[];
}> = ({ lang, paginatedWords, sourceModels, proposals }) => {
  const { t } = useTranslation();
  // TODO: create page per tab, for optimized performance and workflow
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
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
        <WordEntryForm lang={lang} sourceModels={sourceModels} readonly={false} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {/* Need to see here only proposals made by the user */}
        <DictionaryProposalsOverview
          proposals={proposals}
          lang={lang}
          sourceModels={sourceModels}
          readonly={false}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        Review Proposals {[<br key={1} />, <br key={2} />]}Only admins can access this page
        <DictionaryProposalsOverview
          proposals={proposals}
          lang={lang}
          sourceModels={sourceModels}
          readonly={true}
        />
      </CustomTabPanel>
    </Box>
  );
};

export default TabsContent;
