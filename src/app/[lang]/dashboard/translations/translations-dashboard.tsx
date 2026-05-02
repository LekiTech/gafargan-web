'use client';

import * as React from 'react';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Tabs,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import TranslateIcon from '@mui/icons-material/Translate';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ApproveIcon from '@mui/icons-material/CheckCircleOutline';
import RejectIcon from '@mui/icons-material/CancelOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WebsiteLang } from '@api/types.model';
import { IdToLang } from '@api/languages';
import { LangDialects } from '@repository/constants';
import { Proposal } from '@repository/entities/Proposal';
import { ProposalStatus } from '@repository/entities/enums';
import { PaginatedResponse } from '@repository/types.model';
import {
  TranslationLink,
  TranslationLinkTarget,
  TranslationWithLinks,
} from '@repository/translation.repository';
import { SourceModel, SourceModelType, STATE, TranslationModel } from '../models/proposal.model';
import { SourcesCreatableSelect } from '../components/SearchableCreatableSelect';
import { langDialectIdToString } from '../utils';
import { useTranslation } from 'react-i18next';
import { ExampleLine } from '../dictionary/components/WordEntryForm/ExampleLine';
import { flipAndMergeTags } from '@/search/definition/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { approveProposal, rejectProposal } from '@repository/proposal.repository';
import { TFunction } from 'i18next';
import Link from 'next/link';
import { ParsedTextComp } from '@/components/ParsedTextComp';
import { TagComp } from '../../components/TagComp';

type ExampleDraft = {
  id: string;
  value: TranslationModel;
  links: TranslationLink[];
  originalLinks?: TranslationLink[];
};

type TranslationProposalEntry = {
  state: string;
  id?: number;
  phrasesPerLangDialect?: Record<string, { phrase: string; tags?: string[] }[]>;
  tags?: string[];
  links?: TranslationLink[];
  linksState?: string;
};

type WordSearchResult = {
  id: number;
  spelling: string;
  langDialectId: number;
};

const createDraft = (fromLangDialectId = 1, toLangDialectId = 25): ExampleDraft => ({
  id: crypto.randomUUID(),
  value: TranslationModel.createEmpty([fromLangDialectId, toLangDialectId]),
  links: [],
});

const linkKey = (link: Pick<TranslationLink, 'linkType' | 'wordDetailId' | 'definitionId'>) =>
  `${link.linkType}_${link.wordDetailId}_${link.definitionId ?? ''}`;

const sortedLinkKeys = (links: TranslationLink[]) => links.map(linkKey).sort();

const linksAreEqual = (left: TranslationLink[], right: TranslationLink[]) =>
  JSON.stringify(sortedLinkKeys(left)) === JSON.stringify(sortedLinkKeys(right));

const linksStateForDraft = (draft: ExampleDraft) => {
  if (draft.value.getState() === STATE.ADDED) {
    return draft.links.length > 0 ? STATE.ADDED : STATE.UNCHANGED;
  }
  return linksAreEqual(draft.originalLinks ?? [], draft.links) ? STATE.UNCHANGED : STATE.MODIFIED;
};

const translationModelToPayload = (draft: ExampleDraft) => ({
  ...JSON.parse(JSON.stringify(draft.value)),
  links: draft.links,
  linksState: linksStateForDraft(draft),
});

const translationToEditDraft = (translation: TranslationWithLinks): ExampleDraft => ({
  id: `translation-${translation.id}`,
  value: new TranslationModel({
    state: STATE.UNCHANGED,
    id: translation.id,
    phrasesPerLangDialect: translation.phrasesPerLangDialect,
    tags: translation.tags,
  }),
  links: translation.links,
  originalLinks: translation.links,
});

const statusColor = (status: ProposalStatus) => {
  switch (status) {
    case ProposalStatus.APPROVED:
      return 'success';
    case ProposalStatus.REJECTED:
      return 'error';
    default:
      return 'warning';
  }
};

const translationStateColor = (state?: string) => {
  switch (state) {
    case STATE.ADDED:
      return 'success';
    case STATE.MODIFIED:
      return 'warning';
    case STATE.DELETED:
      return 'error';
    default:
      return 'default';
  }
};

const translationsTabs = ['published', 'propose', 'review'] as const;
type TranslationsTab = (typeof translationsTabs)[number];

const tabParamToIndex = (tab: string | null) => {
  const index = translationsTabs.indexOf(tab as TranslationsTab);
  return index === -1 ? 0 : index;
};

function a11yProps(index: number) {
  return {
    id: `translations-tab-${index}`,
    'aria-controls': `translations-tabpanel-${index}`,
  };
}

const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  value: number;
}> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`translations-tabpanel-${index}`}
    aria-labelledby={`translations-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TranslationPhrasesView: React.FC<{
  translation: TranslationWithLinks;
  t: TFunction;
}> = ({ translation, t }) => (
  <Stack gap={1}>
    {Object.entries(translation.phrasesPerLangDialect ?? {}).map(([langDialectId, phrases]) =>
      phrases?.length ? (
        <Box key={langDialectId}>
          <Typography variant="caption" color="text.secondary">
            {langDialectIdToString(Number(langDialectId), t)}
          </Typography>
          <Stack gap={0.5}>
            {phrases.map((phrase, idx) => (
              <Typography key={`${langDialectId}_${idx}`} variant="body2">
                {phrase.phrase}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null,
    )}
  </Stack>
);

const TranslationReviewSidePreview: React.FC<{
  title: string;
  translation?: Partial<TranslationWithLinks> & {
    id?: number;
    state?: string;
    phrasesPerLangDialect?: Record<string, { phrase: string; tags?: string[] }[]>;
    tags?: string[];
    links?: TranslationLink[];
    linksState?: string;
  };
  lang: WebsiteLang;
  linkTargets: TranslationLinkTarget[];
}> = ({ title, translation, lang, linkTargets }) => {
  const { t } = useTranslation(lang);

  if (!translation) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 220,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">No existing published translation.</Typography>
      </Box>
    );
  }

  const phrasesByLang = translation.phrasesPerLangDialect ?? {};
  const langDialectIds = Object.keys(phrasesByLang).map(Number);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        minHeight: 220,
      }}
    >
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {translation.id && <Chip size="small" variant="outlined" label={`#${translation.id}`} />}
        {translation.state && translation.state !== STATE.UNCHANGED && (
          <Chip
            size="small"
            color={translationStateColor(translation.state) as any}
            variant="outlined"
            label={translation.state}
          />
        )}
      </Stack>

      <Stack gap={1.25}>
        {langDialectIds.length > 0 ? (
          langDialectIds.map((langDialectId) => {
            const phrases = phrasesByLang[langDialectId] ?? [];
            if (phrases.length === 0) {
              return null;
            }

            return (
              <Box key={langDialectId}>
                <Typography variant="caption" color="text.secondary">
                  {langDialectIdToString(langDialectId, t)}
                </Typography>
                <Stack gap={0.75}>
                  {phrases.map((phrase, idx) => (
                    <Box key={`${langDialectId}_${idx}`}>
                      <LinkTargetTags tags={phrase.tags} />
                      <Typography component="div" variant="body1">
                        <ParsedTextComp text={phrase.phrase} />
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })
        ) : (
          <Typography color="text.secondary">No sentence text.</Typography>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary">
            Translation tags
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <LinkTargetTags tags={translation.tags} />
            {(!translation.tags || translation.tags.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              Linked entries
            </Typography>
            {translation.linksState && translation.linksState !== STATE.UNCHANGED && (
              <Chip
                size="small"
                color={translationStateColor(translation.linksState) as any}
                variant="outlined"
                label={`links ${translation.linksState}`}
              />
            )}
          </Stack>
          <Box sx={{ mt: 0.5 }}>
            <TranslationLinkTargetsReview
              links={translation.links ?? []}
              linkTargets={linkTargets}
              lang={lang}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

const TranslationLinks: React.FC<{
  links: TranslationLink[];
  lang: WebsiteLang;
}> = ({ links, lang }) => {
  const uniqueLinks = React.useMemo(
    () =>
      Array.from(
        new Map(
          links.map((link) => [
            `${link.linkType}_${link.wordDetailId}_${link.definitionId ?? ''}`,
            link,
          ]),
        ).values(),
      ),
    [links],
  );

  if (uniqueLinks.length === 0) {
    return <Typography color="text.secondary">-</Typography>;
  }

  return (
    <Stack direction="row" gap={0.75} flexWrap="wrap">
      {uniqueLinks.map((link) => {
        const href =
          `/${lang}/search/definition?` +
          new URLSearchParams({
            fromLang: IdToLang[link.wordLangDialectId],
            toLang: IdToLang[link.definitionsLangDialectId],
            exp: link.wordSpelling,
          }).toString();
        return (
          <Chip
            key={`${link.linkType}_${link.wordDetailId}_${link.definitionId ?? ''}`}
            component={Link}
            href={href}
            clickable
            size="small"
            variant="outlined"
            label={
              link.linkType === 'definition'
                ? `${link.wordSpelling} · definition #${link.definitionId}`
                : `${link.wordSpelling} · details #${link.wordDetailId}`
            }
          />
        );
      })}
    </Stack>
  );
};

const LinkTargetTags: React.FC<{ tags?: string[] }> = ({ tags }) => {
  const { t } = useTranslation();
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap">
      {tags.map((tag, idx) => (
        <TagComp key={`${tag}_${idx}`} label={t(tag, { ns: 'tags' })} />
      ))}
    </Stack>
  );
};

const DefinitionLinkTarget: React.FC<{
  target: TranslationLinkTarget;
  checked: boolean;
  onToggle: () => void;
}> = ({ target, checked, onToggle }) => {
  const { t } = useTranslation();
  const values = target.definitionValues ?? [];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 1,
        alignItems: 'flex-start',
        py: 1,
        pl: 0.5,
        borderLeft: '4px solid',
        borderColor: checked ? 'primary.light' : 'divider',
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={onToggle}
        inputProps={{ 'aria-label': target.targetLabel }}
      />
      <Stack gap={0.75}>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" color="text.secondary">
            Meaning
          </Typography>
          <Chip size="small" variant="outlined" label={`#${target.definitionId}`} />
        </Stack>
        <LinkTargetTags tags={target.definitionTags} />
        <Stack gap={0.75}>
          {values.length > 0 ? (
            values.map((value, idx) => (
              <Stack
                key={`${target.definitionId}_${idx}`}
                direction="row"
                gap={1}
                alignItems="flex-start"
              >
                <Typography
                  variant="body2"
                  sx={{ minWidth: 22, fontWeight: 700, color: 'text.secondary' }}
                >
                  {t(`alphabet.${idx}`)}:
                </Typography>
                <Box>
                  <LinkTargetTags tags={value.tags} />
                  <Typography component="div" variant="body1" sx={{ fontSize: 18 }}>
                    <ParsedTextComp text={value.value} />
                  </Typography>
                </Box>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No definition text.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const WordDetailLinkTarget: React.FC<{
  detailTarget?: TranslationLinkTarget;
  definitionTargets: TranslationLinkTarget[];
  checked: boolean;
  onToggleDetail?: () => void;
  isDefinitionChecked: (target: TranslationLinkTarget) => boolean;
  onToggleDefinition: (target: TranslationLinkTarget) => void;
}> = ({
  detailTarget,
  definitionTargets,
  checked,
  onToggleDetail,
  isDefinitionChecked,
  onToggleDefinition,
}) => {
  const { t } = useTranslation();
  const referenceTarget = detailTarget ?? definitionTargets[0];

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: checked ? 'primary.light' : 'divider',
        borderRadius: 1,
        p: 1.25,
        bgcolor: checked ? 'action.selected' : 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 1,
          alignItems: 'flex-start',
        }}
      >
        <Checkbox
          size="small"
          checked={checked}
          onChange={onToggleDetail}
          disabled={!detailTarget}
          inputProps={{ 'aria-label': detailTarget?.targetLabel ?? 'Word detail' }}
        />
        <Stack gap={0.5}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Detail #{referenceTarget.wordDetailId}
            </Typography>
            {referenceTarget.detailInflection && (
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {referenceTarget.detailInflection}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {langDialectIdToString(referenceTarget.definitionsLangDialectId, t)}
          </Typography>
        </Stack>
      </Box>
      {definitionTargets.length > 0 && (
        <Stack gap={1} sx={{ mt: 1 }}>
          {definitionTargets.map((target) => (
            <DefinitionLinkTarget
              key={linkKey(target)}
              target={target}
              checked={isDefinitionChecked(target)}
              onToggle={() => onToggleDefinition(target)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

const DefinitionLinkTargetReview: React.FC<{ target: TranslationLinkTarget }> = ({ target }) => {
  const { t } = useTranslation();
  const values = target.definitionValues ?? [];

  return (
    <Box
      sx={{
        py: 1,
        pl: 1.5,
        borderLeft: '4px solid',
        borderColor: 'divider',
      }}
    >
      <Stack gap={0.75}>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" color="text.secondary">
            Meaning
          </Typography>
          <Chip size="small" variant="outlined" label={`#${target.definitionId}`} />
        </Stack>
        <LinkTargetTags tags={target.definitionTags} />
        <Stack gap={0.75}>
          {values.length > 0 ? (
            values.map((value, idx) => (
              <Stack
                key={`${target.definitionId}_${idx}`}
                direction="row"
                gap={1}
                alignItems="flex-start"
              >
                <Typography
                  variant="body2"
                  sx={{ minWidth: 22, fontWeight: 700, color: 'text.secondary' }}
                >
                  {t(`alphabet.${idx}`)}:
                </Typography>
                <Box>
                  <LinkTargetTags tags={value.tags} />
                  <Typography component="div" variant="body1" sx={{ fontSize: 18 }}>
                    <ParsedTextComp text={value.value} />
                  </Typography>
                </Box>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No definition text.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const TranslationLinkTargetsReview: React.FC<{
  links: TranslationLink[];
  linkTargets: TranslationLinkTarget[];
  lang: WebsiteLang;
}> = ({ links, linkTargets, lang }) => {
  const { t } = useTranslation();
  const targetByKey = React.useMemo(
    () => new Map(linkTargets.map((target) => [linkKey(target), target])),
    [linkTargets],
  );
  const uniqueLinks = React.useMemo(
    () => Array.from(new Map(links.map((link) => [linkKey(link), link])).values()),
    [links],
  );
  const targets = React.useMemo(
    () =>
      uniqueLinks.map((link) => {
        const matchingTarget = targetByKey.get(linkKey(link));
        if (matchingTarget) {
          return matchingTarget;
        }
        return {
          ...link,
          label: link.wordSpelling,
          targetLabel:
            link.linkType === 'definition'
              ? `Definition #${link.definitionId}`
              : `Details #${link.wordDetailId}`,
        };
      }),
    [targetByKey, uniqueLinks],
  );

  if (targets.length === 0) {
    return <Typography color="text.secondary">-</Typography>;
  }

  const targetsByWord = targets.reduce((accumulator, target) => {
    const wordTargets = accumulator.get(target.wordId) ?? [];
    wordTargets.push(target);
    accumulator.set(target.wordId, wordTargets);
    return accumulator;
  }, new Map<number, TranslationLinkTarget[]>());

  return (
    <Stack gap={1}>
      {Array.from(targetsByWord.entries()).map(([wordId, wordTargets]) => {
        const word = wordTargets[0];
        const href =
          `/${lang}/search/definition?` +
          new URLSearchParams({
            fromLang: IdToLang[word.wordLangDialectId],
            toLang: IdToLang[word.definitionsLangDialectId],
            exp: word.wordSpelling,
          }).toString();
        const detailsById = wordTargets.reduce(
          (
            accumulator: Map<
              number,
              {
                detailTarget?: TranslationLinkTarget;
                definitionTargets: TranslationLinkTarget[];
              }
            >,
            target,
          ) => {
            const detail = accumulator.get(target.wordDetailId) ?? {
              detailTarget: undefined,
              definitionTargets: [],
            };

            if (target.linkType === 'wordDetail') {
              detail.detailTarget = target;
            } else {
              detail.definitionTargets.push(target);
            }

            accumulator.set(target.wordDetailId, detail);
            return accumulator;
          },
          new Map(),
        );

        return (
          <Box key={wordId}>
            <Chip component={Link} href={href} clickable size="small" label={word.wordSpelling} />
            <Stack gap={1} sx={{ mt: 1 }}>
              {Array.from(detailsById.entries()).map(([wordDetailId, detail]) => {
                const referenceTarget = detail.detailTarget ?? detail.definitionTargets[0];
                return (
                  <Box
                    key={`${wordId}_${wordDetailId}`}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.25,
                    }}
                  >
                    <Stack gap={0.5}>
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          Detail #{referenceTarget.wordDetailId}
                        </Typography>
                        {referenceTarget.detailInflection && (
                          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                            {referenceTarget.detailInflection}
                          </Typography>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {langDialectIdToString(referenceTarget.definitionsLangDialectId, t)}
                      </Typography>
                    </Stack>
                    {detail.detailTarget && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        Linked to other examples for this detail.
                      </Typography>
                    )}
                    {detail.definitionTargets.length > 0 && (
                      <Stack gap={1} sx={{ mt: 1 }}>
                        {detail.definitionTargets.map((target: TranslationLinkTarget) => (
                          <DefinitionLinkTargetReview key={linkKey(target)} target={target} />
                        ))}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
};

const LinkTargetSelector: React.FC<{
  value: TranslationLink[];
  fromLangDialectId: number;
  onChange: (value: TranslationLink[]) => void;
}> = ({ value, fromLangDialectId, onChange }) => {
  const [query, setQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<WordSearchResult[]>([]);
  const [selectedWordLabels, setSelectedWordLabels] = React.useState<Record<number, string>>({});
  const [targets, setTargets] = React.useState<TranslationLinkTarget[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedWordIds, setSelectedWordIds] = React.useState<number[]>(() =>
    Array.from(new Set(value.map((link) => link.wordId))),
  );
  React.useEffect(() => {
    setSelectedWordIds((current) =>
      Array.from(new Set([...current, ...value.map((link) => link.wordId)])),
    );
    setSelectedWordLabels((current) => ({
      ...current,
      ...Object.fromEntries(value.map((link) => [link.wordId, link.wordSpelling])),
    }));
  }, [value]);
  React.useEffect(() => {
    const controller = new AbortController();
    const trimmedQuery = query.trim();
    const params = new URLSearchParams();
    if (trimmedQuery) {
      params.set('search', trimmedQuery);
      params.set('fromLangDialectId', fromLangDialectId.toString());
    }
    for (const wordId of selectedWordIds) {
      params.append('wordId', wordId.toString());
    }
    if (!trimmedQuery && selectedWordIds.length === 0) {
      setSearchResults([]);
      setTargets([]);
      return () => controller.abort();
    }

    setIsLoading(true);
    fetch(`translations/api?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load link targets');
        }
        return response.json();
      })
      .then((data: { words?: WordSearchResult[]; targets?: TranslationLinkTarget[] }) => {
        setSearchResults(data.words ?? []);
        setTargets(data.targets ?? []);
        setSelectedWordLabels((current) => ({
          ...current,
          ...Object.fromEntries(
            (data.targets ?? []).map((target) => [target.wordId, target.wordSpelling]),
          ),
        }));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [fromLangDialectId, query, selectedWordIds]);

  const words = React.useMemo(() => {
    const wordsById = new Map<
      number,
      {
        wordId: number;
        spelling: string;
        targetCount?: number;
      }
    >();

    for (const word of searchResults) {
      wordsById.set(word.id, {
        wordId: word.id,
        spelling: word.spelling,
      });
    }

    for (const [wordId, spelling] of Object.entries(selectedWordLabels)) {
      wordsById.set(Number(wordId), {
        wordId: Number(wordId),
        spelling,
        targetCount: wordsById.get(Number(wordId))?.targetCount,
      });
    }

    for (const target of targets) {
      const current = wordsById.get(target.wordId);
      wordsById.set(target.wordId, {
        wordId: target.wordId,
        spelling: target.wordSpelling,
        targetCount: (current?.targetCount ?? 0) + 1,
      });
    }

    return Array.from(wordsById.values());
  }, [searchResults, selectedWordLabels, targets]);
  const filteredWords = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }
    return searchResults
      .filter((word) => word.spelling.toLowerCase().includes(normalizedQuery))
      .slice(0, 8)
      .map((word) => ({
        wordId: word.id,
        spelling: word.spelling,
      }));
  }, [query, searchResults]);
  const selectedTargets = React.useMemo(
    () => targets.filter((target) => selectedWordIds.includes(target.wordId)),
    [selectedWordIds, targets],
  );
  const selectedKeys = new Set(value.map(linkKey));

  const toggleTarget = (target: TranslationLinkTarget) => {
    const key = linkKey(target);
    if (selectedKeys.has(key)) {
      onChange(value.filter((link) => linkKey(link) !== key));
      return;
    }
    const { label, targetLabel, detailInflection, definitionValues, definitionTags, ...link } =
      target;
    onChange([...value, link]);
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
      <Stack gap={1.25}>
        <TextField
          size="small"
          fullWidth
          label="Search word to link"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          helperText={isLoading ? 'Searching...' : undefined}
        />
        {filteredWords.length > 0 && (
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {filteredWords.map((word) => (
              <Chip
                key={word.wordId}
                label={word.spelling}
                color={selectedWordIds.includes(word.wordId) ? 'primary' : 'default'}
                variant={selectedWordIds.includes(word.wordId) ? 'filled' : 'outlined'}
                onClick={() => {
                  setSelectedWordIds((current) =>
                    current.includes(word.wordId) ? current : [...current, word.wordId],
                  );
                  setSelectedWordLabels((current) => ({
                    ...current,
                    [word.wordId]: word.spelling,
                  }));
                  setQuery('');
                }}
              />
            ))}
          </Stack>
        )}
        {selectedWordIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Search and select a word, then choose a word detail or definition below.
          </Typography>
        ) : (
          selectedWordIds.map((wordId) => {
            const wordTargets = selectedTargets.filter((target) => target.wordId === wordId);
            const word = words.find((item) => item.wordId === wordId);
            const hasSelectedTargets = wordTargets.some((target) =>
              selectedKeys.has(linkKey(target)),
            );
            const detailsById = wordTargets.reduce(
              (
                accumulator: Map<
                  number,
                  {
                    detailTarget?: TranslationLinkTarget;
                    definitionTargets: TranslationLinkTarget[];
                  }
                >,
                target,
              ) => {
                const detail = accumulator.get(target.wordDetailId) ?? {
                  detailTarget: undefined,
                  definitionTargets: [],
                };

                if (target.linkType === 'wordDetail') {
                  detail.detailTarget = target;
                } else {
                  detail.definitionTargets.push(target);
                }

                accumulator.set(target.wordDetailId, detail);
                return accumulator;
              },
              new Map(),
            );
            const details = Array.from(detailsById.entries());
            return (
              <Box key={wordId} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle2">{word?.spelling ?? `Word #${wordId}`}</Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedWordIds((current) => current.filter((id) => id !== wordId));
                      setSelectedWordLabels((current) => {
                        const next = { ...current };
                        delete next[wordId];
                        return next;
                      });
                      onChange(value.filter((link) => link.wordId !== wordId));
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
                <Stack gap={1} sx={{ mt: 1 }}>
                  {details.map(([wordDetailId, detail]) => (
                    <WordDetailLinkTarget
                      key={`${wordId}_${wordDetailId}`}
                      detailTarget={detail.detailTarget}
                      definitionTargets={detail.definitionTargets}
                      checked={
                        detail.detailTarget ? selectedKeys.has(linkKey(detail.detailTarget)) : false
                      }
                      onToggleDetail={
                        detail.detailTarget ? () => toggleTarget(detail.detailTarget!) : undefined
                      }
                      isDefinitionChecked={(target) => selectedKeys.has(linkKey(target))}
                      onToggleDefinition={toggleTarget}
                    />
                  ))}
                </Stack>
                {!hasSelectedTargets && (
                  <Typography variant="caption" color="text.secondary">
                    Pick one or more targets for this word.
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </Stack>
    </Box>
  );
};

const TranslationProposalPreview: React.FC<{
  proposal: Proposal;
  lang: WebsiteLang;
  baselineTranslations: Record<number, TranslationWithLinks>;
  reviewLinkTargets: TranslationLinkTarget[];
}> = ({ proposal, lang, baselineTranslations, reviewLinkTargets }) => {
  const data = proposal.data as { entries?: TranslationProposalEntry[] };
  const entries = data.entries ?? [];

  return (
    <Stack gap={2}>
      <Typography variant="h6" fontWeight={700}>
        Review translations
      </Typography>
      {entries.map((entry, idx) => {
        const baseline =
          entry.state !== STATE.ADDED && entry.id !== undefined
            ? baselineTranslations[entry.id]
            : undefined;
        const isNewTranslation = entry.state === STATE.ADDED && !baseline;

        return (
          <Card key={`${proposal.id}_${idx}`} variant="outlined">
            <CardHeader
              title={
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Translation {idx + 1}
                  </Typography>
                  <Chip
                    size="small"
                    color={translationStateColor(entry.state) as any}
                    variant="outlined"
                    label={entry.state}
                  />
                  {entry.linksState && entry.linksState !== STATE.UNCHANGED && (
                    <Chip
                      size="small"
                      color={translationStateColor(entry.linksState) as any}
                      variant="outlined"
                      label={`links ${entry.linksState}`}
                    />
                  )}
                </Stack>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isNewTranslation ? '1fr' : { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                {!isNewTranslation && (
                  <TranslationReviewSidePreview
                    title="Before proposal changes"
                    translation={baseline}
                    lang={lang}
                    linkTargets={reviewLinkTargets}
                  />
                )}
                <TranslationReviewSidePreview
                  title={
                    isNewTranslation ? 'New translation after approval' : 'Proposal after approval'
                  }
                  translation={entry}
                  lang={lang}
                  linkTargets={reviewLinkTargets}
                />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

const TranslationsDashboard: React.FC<{
  lang: WebsiteLang;
  translations: PaginatedResponse<TranslationWithLinks>;
  sourceModels: SourceModelType[];
  proposals: PaginatedResponse<Proposal>;
  proposalsHistory: PaginatedResponse<Proposal>;
  baselineTranslations: Record<number, TranslationWithLinks>;
  reviewLinkTargets: TranslationLinkTarget[];
}> = ({
  lang,
  translations,
  sourceModels,
  proposals,
  proposalsHistory,
  baselineTranslations,
  reviewLinkTargets,
}) => {
  const { t, i18n } = useTranslation(lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = tabParamToIndex(searchParams.get('tab'));
  const [sources] = React.useState<SourceModel[]>(
    sourceModels.map((source) => new SourceModel(source)),
  );
  const [selectedSource, setSelectedSource] = React.useState<SourceModel>(sources[0]);
  const [fromLangDialectId, setFromLangDialectId] = React.useState(1);
  const [toLangDialectId, setToLangDialectId] = React.useState(25);
  const [drafts, setDrafts] = React.useState<ExampleDraft[]>([createDraft()]);
  const [selectedTranslation, setSelectedTranslation] = React.useState<ExampleDraft | undefined>();
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | undefined>();
  const [alert, setAlert] = React.useState<{
    severity: 'success' | 'error' | 'info';
    text: string;
  }>();
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = React.useMemo(
    () =>
      Object.entries(flipAndMergeTags(tagEntries)).filter(
        (kv) => kv != null && kv[0] != null && kv[1] != null,
      ) as [string, string][],
    [tagEntries],
  );

  const dialectOptions = React.useMemo(
    () =>
      Object.entries(LangDialects).map(([id]) => ({
        id: Number(id),
        label: langDialectIdToString(Number(id), t),
      })),
    [t],
  );

  const updateDraft = (id: string, value: TranslationModel) => {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, value } : draft)));
  };

  const updateDraftLinks = (id: string, links: TranslationLink[]) => {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, links } : draft)));
  };

  const deleteDraft = (id: string) => {
    setDrafts((current) =>
      current.length === 1
        ? [createDraft(fromLangDialectId, toLangDialectId)]
        : current.filter((draft) => draft.id !== id),
    );
  };

  const hasCompletePhrase = (draft: TranslationModel) =>
    draft
      .getAllLangDialectIds()
      .map((langDialectId) => draft.getPhrasesByLangDialect(langDialectId) ?? [])
      .flat()
      .some((phrase) => phrase.phrase.trim().length > 0);

  const handleTranslationsPageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = translationsTabs[newValue];
    if (tab === translationsTabs[0]) {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const replaceProposalPaginationParams = (
    newPage: number,
    newRowsPerPage: number,
    options?: { history?: boolean },
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    const keyPrefix = options?.history ? 'proposalsHistory' : 'proposals';
    params.set(`${keyPrefix}Page`, Math.max(1, newPage + 1).toString());
    params.set(`${keyPrefix}PageSize`, newRowsPerPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const renderProposalsTable = (
    paginatedProposals: PaginatedResponse<Proposal>,
    options?: { history?: boolean },
  ) => {
    const tablePage = Math.max(0, paginatedProposals.currentPage - 1);
    const rowsPerPage = paginatedProposals.pageSize;

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Proposed at</TableCell>
              <TableCell>Proposed by</TableCell>
              <TableCell>Examples</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProposals.items.map((proposal) => {
              const data = proposal.data as { entries?: any[] };
              return (
                <TableRow key={proposal.id}>
                  <TableCell>{proposal.id}</TableCell>
                  <TableCell>{new Date(proposal.proposedAt).toLocaleString()}</TableCell>
                  <TableCell>{proposal.proposedBy.name}</TableCell>
                  <TableCell>{data.entries?.length ?? 0}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={statusColor(proposal.status) as any}
                      label={proposal.status}
                    />
                  </TableCell>
                  <TableCell>{proposal.comment}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setSelectedProposal(proposal)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedProposals.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">No translation proposals here.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                count={paginatedProposals.totalItems}
                rowsPerPage={rowsPerPage}
                page={tablePage}
                onPageChange={(_, newPage) =>
                  replaceProposalPaginationParams(newPage, rowsPerPage, options)
                }
                onRowsPerPageChange={(event) =>
                  replaceProposalPaginationParams(0, parseInt(event.target.value, 10), options)
                }
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  };

  const submit = async () => {
    const entries = drafts
      .filter((draft) => hasCompletePhrase(draft.value))
      .map((draft) => translationModelToPayload(draft));

    if (entries.length === 0) {
      setAlert({ severity: 'info', text: 'Add at least one complete sentence pair.' });
      return;
    }

    const result = await fetch('translations/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries,
        sourceId: selectedSource.getId(),
      }),
    });

    if (result.status >= 300) {
      setAlert({ severity: 'error', text: 'Could not send translations for review.' });
      return;
    }

    setAlert({ severity: 'success', text: 'Translations were sent for review.' });
    setDrafts([createDraft(fromLangDialectId, toLangDialectId)]);
  };

  const submitEdit = async () => {
    if (!selectedTranslation || !hasCompletePhrase(selectedTranslation.value)) {
      setAlert({ severity: 'info', text: 'Add at least one complete sentence pair.' });
      return;
    }
    if (
      selectedTranslation.value.getState() === STATE.UNCHANGED &&
      linksStateForDraft(selectedTranslation) === STATE.UNCHANGED
    ) {
      setAlert({ severity: 'info', text: 'Change the translation text, tags, or linked entries.' });
      return;
    }

    const result = await fetch('translations/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [translationModelToPayload(selectedTranslation)],
        sourceId: selectedSource.getId(),
      }),
    });

    if (result.status >= 300) {
      setAlert({ severity: 'error', text: 'Could not send translation edit for review.' });
      return;
    }

    setAlert({ severity: 'success', text: 'Translation edit was sent for review.' });
    setSelectedTranslation(undefined);
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1}>
          <TranslateIcon color="primary" />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Sentence translations
          </Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Add complete sentence pairs, idioms, and usage examples that can be reviewed before they
          become public.
        </Typography>
      </Box>

      {alert && <Alert severity={alert.severity}>{alert.text}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="translations tabs">
          <Tab label="Published translations" {...a11yProps(0)} />
          <Tab label="Propose translations" {...a11yProps(1)} />
          <Tab label="Review proposals" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={<CheckCircleIcon color="success" />}
            title="Published sentence translations"
            subheader={`${translations.totalItems} total`}
          />
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Pagination
                count={translations.totalPages}
                page={translations.currentPage}
                siblingCount={1}
                showFirstButton
                showLastButton
                onChange={handleTranslationsPageChange}
              />
              <Select
                size="small"
                value={translations.pageSize}
                onChange={(event) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', '1');
                  params.set('pageSize', event.target.value.toString());
                  router.replace(`${pathname}?${params.toString()}`);
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Sentences</TableCell>
                    <TableCell>Linked entries</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {translations.items.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell>{translation.id}</TableCell>
                      <TableCell sx={{ minWidth: 320 }}>
                        {Object.keys(translation.phrasesPerLangDialect).length > 0 ? (
                          <TranslationPhrasesView translation={translation} t={t} />
                        ) : (
                          <ParsedTextComp text={translation.raw ?? ''} />
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        <TranslationLinks links={translation.links} lang={lang} />
                      </TableCell>
                      <TableCell>{translation.tags?.join(', ') || '-'}</TableCell>
                      <TableCell>{new Date(translation.updatedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() =>
                            setSelectedTranslation(translationToEditDraft(translation))
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {translations.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary">
                          No published translations yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {translations.totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 1.5 }}>
                <Pagination
                  count={translations.totalPages}
                  page={translations.currentPage}
                  siblingCount={1}
                  showFirstButton
                  showLastButton
                  onChange={handleTranslationsPageChange}
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader title="Propose translations" />
          <CardContent>
            <Grid container columns={{ xs: 6 }} spacing={1.5} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <SourcesCreatableSelect
                  label={t('addNewWord.source', { ns: 'dashboard' })}
                  options={sources}
                  value={selectedSource}
                  lang={lang}
                  onChange={setSelectedSource}
                  readonly={false}
                  placeholder="Choose a source"
                />
              </Grid>
              <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
                <Select
                  size="small"
                  value={fromLangDialectId}
                  sx={{ flex: 1 }}
                  onChange={(event) => setFromLangDialectId(Number(event.target.value))}
                >
                  {dialectOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <Typography>→</Typography>
                <Select
                  size="small"
                  value={toLangDialectId}
                  sx={{ flex: 1 }}
                  onChange={(event) => setToLangDialectId(Number(event.target.value))}
                >
                  {dialectOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>

            <Stack gap={1.5}>
              {drafts.map((draft) => (
                <Stack key={draft.id} gap={1}>
                  <ExampleLine
                    example={draft.value}
                    onChange={(value) => updateDraft(draft.id, value)}
                    onDelete={() => deleteDraft(draft.id)}
                    isInnerBlockExample={false}
                    tagEntries={tagEntries}
                    allTags={allTags}
                    lang={lang}
                    readonly={false}
                  />
                  <LinkTargetSelector
                    value={draft.links}
                    fromLangDialectId={fromLangDialectId}
                    onChange={(links) => updateDraftLinks(draft.id, links)}
                  />
                </Stack>
              ))}
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                setDrafts((current) => [
                  ...current,
                  createDraft(fromLangDialectId, toLangDialectId),
                ])
              }
            >
              Add example
            </Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={submit}>
              Send to review
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={<RateReviewIcon color="warning" />}
            title="Translation proposals"
            subheader={`${proposals.totalItems} pending`}
          />
          <CardContent>
            <Stack gap={2}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Needs review
                </Typography>
                {renderProposalsTable(proposals)}
              </Box>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">History</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderProposalsTable(proposalsHistory, { history: true })}
                </AccordionDetails>
              </Accordion>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>
      {selectedProposal && (
        <Modal
          open={selectedProposal !== undefined}
          onClose={() => setSelectedProposal(undefined)}
          aria-labelledby="translations-proposal-title"
        >
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(1200px, 95vw)',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            <CardHeader
              action={
                <IconButton onClick={() => setSelectedProposal(undefined)}>
                  <CloseIcon />
                </IconButton>
              }
              title={
                <Stack direction="row" gap={2}>
                  {selectedProposal.proposedBy.name}
                  <Chip
                    size="small"
                    color={statusColor(selectedProposal.status) as any}
                    label={selectedProposal.status}
                  />
                </Stack>
              }
              subheader={new Date(selectedProposal.proposedAt).toLocaleString()}
            />
            <CardContent sx={{ maxHeight: '70vh', overflowY: 'auto', mb: '20px' }}>
              <TranslationProposalPreview
                proposal={selectedProposal}
                lang={lang}
                baselineTranslations={baselineTranslations}
                reviewLinkTargets={reviewLinkTargets}
              />
            </CardContent>
            {selectedProposal.status === ProposalStatus.PENDING && (
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<RejectIcon />}
                  onClick={async () => {
                    const comment = prompt('What is the reason for rejection?');
                    if (comment) {
                      try {
                        await rejectProposal(selectedProposal.id, 1, comment);
                        window.location.reload();
                      } catch (e: any) {
                        window.alert(`Cannot reject proposal. ${e.message}`);
                      }
                    }
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={async () => {
                    try {
                      await approveProposal(selectedProposal.id, 1);
                      window.location.reload();
                    } catch (e: any) {
                      window.alert(`Cannot approve proposal. ${e.message}`);
                    }
                  }}
                >
                  Approve
                </Button>
              </CardActions>
            )}
          </Card>
        </Modal>
      )}
      {selectedTranslation && (
        <Modal open={true} onClose={() => setSelectedTranslation(undefined)}>
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(1000px, 95vw)',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            <CardHeader
              title="Edit translation"
              action={
                <IconButton onClick={() => setSelectedTranslation(undefined)}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Stack gap={2}>
                <ExampleLine
                  example={selectedTranslation.value}
                  onChange={(value) =>
                    setSelectedTranslation((current) => (current ? { ...current, value } : current))
                  }
                  onDelete={() => setSelectedTranslation(undefined)}
                  isInnerBlockExample={false}
                  tagEntries={tagEntries}
                  allTags={allTags}
                  lang={lang}
                  readonly={false}
                />
                <LinkTargetSelector
                  value={selectedTranslation.links}
                  fromLangDialectId={fromLangDialectId}
                  onChange={(links) =>
                    setSelectedTranslation((current) => (current ? { ...current, links } : current))
                  }
                />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<SendIcon />} onClick={submitEdit}>
                Send edit to review
              </Button>
            </CardActions>
          </Card>
        </Modal>
      )}
    </Box>
  );
};

export default TranslationsDashboard;
