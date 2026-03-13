import React, {useState} from 'react';
import SearchResults from "./SearchResults";
import {
    Heading,
    Center,
    Stack,
    Input, InputGroup, InputLeftAddon,
    Button, Divider, Text,
    Card, CardHeader, CardBody, CardFooter,
    Alert, AlertIcon } from '@chakra-ui/react'
import './MainPage.css';

function MainPage() {
    const [copyright, setCopyright] = useState('');
    const [resultsLoaded, setResultsLoaded] = useState(false);
    const [articleList, setarticleList] = useState([]);
    const [archiveFormData, setArchiveFormData] = useState({
        month: 0,
        year: 0,
    });
    const [formDate, setFormDate] = useState({month: 0, year: 0,});
    const [yearError, setYearError] = useState(false);
    const [yearErrorMessage, setYearErrorMessage] = useState("");
    const [monthError, setMonthError] = useState(false);
    const [monthErrorMessage, setMonthErrorMessage] = useState('');
    const [formatError, setFormatError] = useState(false);
    const [formatErrorMessage, setFormatErrorMessage] = useState('');
    const [fetchError, setFetchError] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    // Handle when the form changes
    const handleChange = (event) => {
        setArchiveFormData({
            ...archiveFormData,
            [event.target.name]: event.target.value
        });
    };

    // Handle the reset page button.
    const resetPage = async(event) => {
        event.preventDefault();
        setResultsLoaded(false);
        setIsSearching(false);
        setYearError(false);
        setYearErrorMessage("");
        setMonthError(false);
        setMonthErrorMessage('');
        setFormatError(false);
        setFormatErrorMessage('');
        setFetchError(false);
    };

    // Handle the search button.
    const fetchArchive = async (event) => {
        const archiveURL = `${BACKEND_URL}/nyt?year=${archiveFormData.year}&month=${archiveFormData.month}`;
        event.preventDefault();
        setResultsLoaded(false);
        setIsSearching(false);
        setFormDate(archiveFormData);

        const currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        currentMonth++;  // Increase by one, as the Date object has Jan = 0.
        const yearRegex = /^\d{4}$/;
        const monthRegex = /^\d{1,2}$/;

        if (!yearRegex.test(archiveFormData.year) || !monthRegex.test(archiveFormData.month)) {
            setFormatError(true);
            setFormatErrorMessage('Enter the year as 4 digits (YYYY) and the month as a number between 1 and 12');
            return;
        }

        const formYear = parseInt(archiveFormData.year, 10);
        const formMonth = parseInt(archiveFormData.month, 10);

        if (formYear < 1851 || formYear > currentYear) {
            setYearError(true);
            setYearErrorMessage(`Enter a year between 1851 and ${currentYear}.`);
        } else if ((formYear < currentYear) && (formMonth > 12)) {
            setMonthError(true);
            setMonthErrorMessage('Enter a month between 1 and 12.');
        } else if (formYear === currentYear && (formMonth > currentMonth)) {
            setMonthError(true);
            setMonthErrorMessage(`Enter a month between 1 and ${currentMonth}.`);
        } else {
            setIsSearching(true);
            const archiveResponse = await fetch(archiveURL);
            setIsSearching(false);
            if (archiveResponse.ok) {
                const archiveData = await archiveResponse.json();
                // console.log(`***** Archive Data ==> ${JSON.stringify(archiveData)}`);
                setCopyright(archiveData.copyright);
                setResultsLoaded(true);
                setarticleList(archiveData.response.docs);
                setYearError(false);
                setYearErrorMessage("");
                setMonthError(false);
                setMonthErrorMessage('');
                setFormatError(false);
                setFormatErrorMessage('');
                setFetchError(false);
            } else {
                setFetchError(true);
            };
        };
        // console.log(`***** Copyright: ${copyright}`);
        // console.log(`***** Article Info: ${JSON.stringify(articleList)}`);
        // console.log(`***** Component Status: ${resultsLoaded}`);
    };

    // Handle the search archive button.
    // const searchArchive = async (event) => {
    //     const searchURL = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&api-key=${API_KEY}`;
    //     event.preventDefault();

    //     const archiveResponse = await fetch(searchURL);
    //     if (archiveResponse.ok) {
    //         const archiveData = await archiveResponse.json();
    //         console.log(`***** Search Archive Data ==> ${JSON.stringify(archiveData)}`);

    //     } else {
    //         window.confirm("There was a problem searching the NY Times archive.")
    //     }
    // };

    // Handle the Top Stories button.
    // const fetchTopStories = async (event) => {
    //     event.preventDefault();

    //     const archiveResponse = await fetch(topStoriesURL);
    //     if (archiveResponse.ok) {
    //         const archiveData = await archiveResponse.json();
    //         console.log(`***** Top Stories Data ==> ${JSON.stringify(archiveData)}`);

    //     } else {
    //         window.confirm("There was a problem fetching the NY Times Top Stories.")
    //     }
    // };

    const freshLanding = () => (
        <div className="initialdisplay">
            <Heading as='h2' size='md' color="brand.100">No results yet...</Heading>
        </div>
    );

    return (
        <main id="main-content" className="content">
            <div className="searches">
                <Center><Heading as='h1' size='xl' color="brand.100">Headline Editor</Heading></Center>
                <Center><Text fontSize='xl' marginBottom='10px' color="brand.100" textAlign='center'>Play with NY Times Headlines from the Archives</Text></Center>
                <Card bg="brand.200" className="search-card" width={['95%', '400px']} maxWidth='400px' boxShadow='lg' border='1px' borderColor='gray.100'>
                    <CardHeader>
                        <Text color="brand.100">Retrieve all articles for any month between 1851 and now. If the current year/month does not work&mdash;recent content can be restricted&mdash;try earlier dates.</Text>
                    </CardHeader>
                    <CardBody>
                        <form id='archive-form' aria-label="Search NY Times archive">
                            <Stack spacing={1}>
                                <InputGroup>
                                    <InputLeftAddon w='120px' color="brand.100" aria-hidden="true">Year (YYYY)</InputLeftAddon>
                                    <Input onChange={handleChange} type="text" id="year" name="year" placeholder="2024" variant='outline' width='100px' bg="brand.300" aria-label="Year, 4 digits (YYYY)"/>
                                </InputGroup>
                                <InputGroup>
                                    <InputLeftAddon w='120px' color="brand.100" aria-hidden="true">Month (M)</InputLeftAddon>
                                    <Input onChange={handleChange} type="text" id="month" name="month" placeholder="5" variant='outline' width='100px' bg="brand.300" aria-label="Month, number 1 to 12"/>
                                </InputGroup>
                            </Stack>
                        </form>
                    </CardBody>
                    <Divider color="brand.200" />
                    <CardFooter>
                        <Stack spacing={2} direction='row' align='center'>
                            <Button type="button" onClick={fetchArchive} className="button" size='sm' color="brand.300" bg="brand.100">Search</Button>
                            <Button type="button" onClick={resetPage} className="button" size='sm' color="brand.100" bg="brand.300">Reset Page</Button>
                        </Stack>
                    </CardFooter>
                    { yearError  &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { yearErrorMessage }
                        </Alert>
                    }
                    { monthError  &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { monthErrorMessage }
                        </Alert>
                    }
                    { formatError &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { formatErrorMessage }
                        </Alert>
                    }
                    { fetchError &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            There was a problem fetching the NY Times archive.
                        </Alert>
                    }
                </Card>
            </div>
            <div className="results" aria-live="polite">
                {resultsLoaded ? <SearchResults formData={formDate} articleData={articleList} copyright={copyright} /> : isSearching ? <div className="initialdisplay"><Heading as='h2' size='md' color="brand.100">Searching...</Heading></div> : freshLanding()}
            </div>
        </main>

    );

};

export default MainPage;
