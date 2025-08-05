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
import { SourceModelType } from '@/dashboard/models/proposal.model';
import ProposalsOverview from './ProposalsOverview';

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
  paginatedWords: PaginatedResponse<Word>;
  sourceModels: SourceModelType[];
}> = ({ lang, paginatedWords, sourceModels }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Public Data" {...a11yProps(0)} />
          <Tab label="Add Words" {...a11yProps(1)} />
          <Tab label="My Proposals" {...a11yProps(2)} />
          <Tab label="Review Proposals" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <FoundDefinitionsList lang={lang} paginatedWords={paginatedWords} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <WordEntryForm lang={lang} sourceModels={sourceModels} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <ProposalsOverview />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        Review Proposals {[<br />, <br />]}Only admins can access this page
        <ProposalsOverview />
      </CustomTabPanel>
    </Box>
  );
};

export default TabsContent;
