import React from 'react';
import { Divider, Flex, FormControl, FormLabel, Link, Switch, Text } from '@chakra-ui/react'
import { useDyslexia } from '../DyslexiaContext';
import './Footer.css';

function Footer() {
    const { dyslexiaMode, setDyslexiaMode } = useDyslexia();

    return (
        <footer className="footer">
            <Divider />
            <Flex pt='8px' pb='4px' align='center'>
                <FormControl display='flex' alignItems='center' width='auto'>
                    <Switch
                        id='dyslexia-mode'
                        isChecked={dyslexiaMode}
                        onChange={() => setDyslexiaMode(!dyslexiaMode)}
                        size='sm'
                        colorScheme='blue'
                    />
                    <FormLabel htmlFor='dyslexia-mode' mb='0' ml='2' fontSize='sm' fontWeight='normal' cursor='pointer'>
                        Dyslexia-friendly mode
                    </FormLabel>
                </FormControl>
            </Flex>
            <Text pt='5px' fontSize='sm'>
                Designed by <Link textDecoration="underline" href="https://wandamccrae.com/" target="_blank" rel="noopener noreferrer" isExternal aria-label="Visit Wanda L. McCrae's website, opens in new tab">Wanda L. McCrae</Link>, Copyright 2024-2026.
            </Text>
        </footer>
    )
};

export default Footer;
