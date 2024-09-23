'use client'

import { Grid, MenuItem, Select, TextField } from '@mui/material'
import React from 'react'
import translateStyle from './translate.module.css'

const tabStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}


function Translate() {
    const oprionsLangs = [
        { value: 'ru', title: 'Русский' },
        { value: 'lez', title: 'Лезгинский' },
        { value: 'az', title: 'Азербайджанский' },
    ]
    return (
        <>
            <section className="translator" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Grid container sx={{ maxWidth: '1400px', padding: '0 30px' }}>
                    <Grid item xs={12} lg={12} sx={{ display: 'flex', gap: '10px' }}>
                        <Grid xs={12} md={6} lg={6} >
                            <div style={tabStyle}>
                                <Select
                                    defaultValue="Benz"
                                    placeholder="Enter Car Brand"
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    {oprionsLangs.map((lang) => {
                                        return <MenuItem key={lang.value} value={lang.value}>{lang.title}</MenuItem >
                                    })}

                                </Select>
                            </div>
                            <textarea
                                name=""
                                placeholder='Введите'
                                className={translateStyle.textAreaStyle}
                            ></textarea>

                        </Grid>
                        <Grid xs={12} md={6} lg={6}>
                            <div style={tabStyle}>
                                <Select
                                    defaultValue="Benz"
                                    placeholder="Enter Car Brand"
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    {oprionsLangs.map((lang) => {
                                        return <MenuItem value={lang.value}>{lang.title}</MenuItem >
                                    })}
                                </Select>
                            </div>
                            <textarea name="" id="" disabled className={translateStyle.textAreaStyle}></textarea>

                        </Grid>
                    </Grid>
                </Grid>
            </section>
        </>
    )
}

export default Translate






