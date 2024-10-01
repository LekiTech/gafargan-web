'use client'

import { Button, CircularProgress, Grid, IconButton, MenuItem, Select, TextField } from '@mui/material'
import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import translateStyle from './translate.module.css'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Image from 'next/image';
import images from '@/store/images';
import { WebsiteLang } from '../../../api/types.model';
import SendIcon from '@mui/icons-material/Send';
import { useQuery } from '@tanstack/react-query';

function Translate() {
    const [frstLng, setFrstLng] = useState<string>('ru');
    const [secLng, setSecLng] = useState<string>('lez');
    const [inText, setInText] = useState<string>('');
    const [resText, setResText] = useState<string>('He Hey!');

    const oprionsLangs = [
        { value: 'ru', title: 'Русский' },
        { value: 'lez', title: 'Лезгинский' },
        { value: 'az', title: 'Азербайджанский' },
    ]
    const getLangLabel = (lang: WebsiteLang) => (`languages.${lang}`);

    function swapHandler() {
        setSecLng(frstLng)
        setFrstLng(secLng)
    }

    function textHandler(e: ChangeEvent<HTMLInputElement>) {
        setInText(e.target.value)
    }
    function resetHandler() {
        setInText('')
        setResText('')
    }
    function copyHandler(text: string) {
        navigator.clipboard.writeText(text)
    }

    const [debouncedText, setDebouncedText] = useState(inText);
    useEffect(() => {
        setDebouncedText('')
        const timeoutId = setTimeout(() => setDebouncedText(inText), 500);
        return () => clearTimeout(timeoutId);
    }, [inText])

    const { data, isPending } = useQuery({
        queryKey: ['translate', debouncedText],
        queryFn: ({ signal }) => {
            if (!debouncedText) return '';
            return fetch('/api/translate', {
                method: 'POST',
                body: JSON.stringify({ text: debouncedText }),
                signal,
            }).then(res => res.json()).then(res => res.text)
        },
    })

    return (
        <>
            <section className="translator" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Grid item container sx={{ maxWidth: '1400px', padding: '0 30px' }}>
                    <Grid item xs={12} lg={12} sx={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '10px' }} >
                        <Grid item xs={12} md={6} lg={6} >
                            <Select
                                value={frstLng}
                                defaultValue='ru'
                                sx={{
                                    width: '100%',
                                    textAlign: 'center',
                                    '& .MuiSelect-select': {
                                        padding: '10px'
                                    }
                                }}
                                onChange={(e) => { setFrstLng(e.target.value) }}
                            >
                                {oprionsLangs.map((lang) => {
                                    return <MenuItem key={lang.value} value={lang.value}>{lang.title}</MenuItem >
                                })}
                            </Select>
                        </Grid>
                        <Grid  >
                            <button className={translateStyle.swapBtn} onClick={() => swapHandler()}>
                                <SwapHorizIcon />
                            </button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={6} >
                            <Select
                                value={secLng}
                                defaultValue='lez'
                                placeholder="Enter Car Brand"
                                sx={{
                                    width: '100%',
                                    textAlign: 'center'
                                    ,
                                    '& .MuiSelect-select': {
                                        padding: '10px'
                                    }
                                }}
                                onChange={(e) => { setSecLng(e.target.value) }}

                            >
                                {oprionsLangs.map((lang) => {
                                    return <MenuItem key={lang.value} value={lang.value}>{lang.title}</MenuItem >
                                })}

                            </Select>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} lg={12} className={translateStyle.fieldsWrapp} >
                        <Grid item xs={12} md={6} lg={6} style={{ position: 'relative' }}>
                            <TextField
                                className={translateStyle.textField}
                                type="text"
                                variant="outlined"
                                multiline
                                placeholder='Введите текст'
                                onChange={textHandler}
                                value={inText}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        padding: '16.5px 35px 45px 14px',

                                        '& fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        width: '100%'
                                    },
                                }}
                            />
                            {
                                inText !== '' &&
                                <button onClick={resetHandler} className={`${translateStyle.closeBtn}  ${translateStyle.classicBtn}`}>
                                    <CloseIcon />
                                </button>
                            }
                            {
                                inText !== '' &&
                                <div className={translateStyle.actions}>
                                    <IconButton
                                        onClick={() => { }} className={translateStyle.classicBtn}
                                    >
                                        <VolumeUpIcon />
                                    </IconButton>
                                </div>
                            }

                        </Grid>
                        <Grid item xs={12} md={6} lg={6} style={{ position: 'relative' }}>
                            {isPending && (
                                <CircularProgress style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 1, translate: '-50% -50%' }} />
                            )}

                            <TextField
                                type="text"
                                variant="outlined"
                                className={translateStyle.textField}
                                multiline
                                disabled
                                value={data}
                                placeholder='Перевод'
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        padding: '16.5px 35px 45px 14px',
                                        '& fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'transparent',
                                        },
                                        '&.Mui-disabled fieldset': {
                                            borderColor: 'transparent',
                                        },

                                    },
                                }}
                            />

                            {
                                inText !== '' &&
                                <div className={translateStyle.actions}>
                                    <span>
                                        <IconButton
                                            onClick={() => { }} className={translateStyle.classicBtn}
                                        >
                                            <VolumeUpIcon />
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            aria-label="copy"
                                            onClick={() => copyHandler(resText)} className={translateStyle.classicBtn}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>

                                    </span>

                                    <button onClick={() => { }} className={translateStyle.suggestTransBtn}>
                                        Предложить перевод
                                    </button>
                                </div>
                            }

                        </Grid>
                    </Grid>
                </Grid>
            </section >



            <section className={translateStyle.userTranslate} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Grid item container sx={{ maxWidth: '1400px', padding: '0 30px' }}>
                    <div className={translateStyle.userTranslateTtile}>
                        <h5>Внесите свой вклад в развитие лезгинского переводчика. Переведите предложения ниже на лезгинский.</h5>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 'unset', width: '100%' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', minWidth: '100px' }}>
                                <Image
                                    width="24"
                                    height="15"
                                    src={images.russianFlag}
                                    alt="rus"
                                    style={{ marginRight: '10px' }}
                                />
                                Русский
                            </span>
                            <span style={{ fontWeight: '600' }}>Я даже не знаю что сказать.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', minWidth: '100px' }}>
                                <Image
                                    width="24"
                                    height="15"
                                    src={images.ukFlag}
                                    alt="eng"
                                    style={{ marginRight: '10px' }}
                                />
                                English
                            </span>
                            <span style={{ fontWeight: '600' }}>I just don't know what to say.</span>
                        </li>
                        <li className={translateStyle.suggestForm} style={{}}>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', minWidth: '100px' }}>
                                <Image
                                    width="24"
                                    height="15"
                                    src={images.lezgiFlag}
                                    alt="eng"
                                    style={{ marginRight: '10px' }}
                                />
                                Лезги
                            </span>
                            <span style={{ display: 'flex', height: '40px', alignItems: 'center', gap: '5px', fontWeight: '600', width: '100%' }}>
                                <TextField
                                    variant="outlined"
                                    placeholder='Введите текст'
                                    className={translateStyle.sendInp}
                                    inputProps={{
                                        style: { padding: '10px' }

                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#0F3B2E',
                                            },
                                        },
                                    }}
                                />
                                <IconButton
                                    aria-label="copy"
                                    onClick={() => { }}
                                    className={translateStyle.sendBtn}
                                >
                                    <SendIcon />
                                </IconButton>
                            </span>
                        </li>
                    </ul>
                </Grid>
            </section>
        </>
    )
}

export default Translate
