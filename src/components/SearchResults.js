import React, { useState, useEffect } from 'react';
import {
    Heading,
    Text,
    Divider,
    Select,
    Button, Image,
    Link, Input,
    Flex, VStack,
    Box } from '@chakra-ui/react';
import './SearchResults.css';

function SearchResults(props) {
    // console.log('***** (SearchResults) Props: ', props);
    const monthDict = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    };

    const [myArticleId, setMyArticleId] = useState({});
    const [myArticle, setMyArticle] = useState({});
    const [myArticleImageUrl, setMyArticleImageUrl] = useState('');
    const [articleLoaded, setArticleLoaded] = useState(false);
    const [userHeadline, setUserHeadline] = useState('');
    const [articleYear, setArticleYear] = useState(0);
    const [articleDay, setArticleDay] = useState(0);
    const [articleMonth, setArticleMonth] = useState(0);

    // Set the ID for the selected article.
    const handleChange = async (event) => {
      setMyArticleId(event.target.value);
    };

    // Handle when the user edits the headline
    const editHeadline = (event) => {
        setUserHeadline(event.target.value);
    };

    // Update the headline
    const handleEdit = async (event) => {
        setMyArticle({
            ...myArticle,  // Spread the existing state variable
            headline: {
                ...myArticle.headline, // Spread the existing nested object
                main: userHeadline,  // Update the nested property
            },
        });
    };

    useEffect(() => {
        // Load that article's data when myArticleId changes.
        const foundArticle = props.articleData.find(article => article._id === myArticleId);
        if (foundArticle !== undefined) {
            const rawDate = new Date(foundArticle.pub_date);
            setArticleMonth(rawDate.getMonth() + 1);
            setArticleYear(rawDate.getFullYear());
            setArticleDay(rawDate.getDate());
        };
        setMyArticle(foundArticle || {});
        setArticleLoaded(false); // Reset articleLoaded to false whenever myArticleId changes
        if (foundArticle !== undefined &&
            foundArticle.multimedia !== undefined &&
            foundArticle.multimedia[4] !== undefined) {
            const imageUrl = `https://nytimes.com/${foundArticle.multimedia[4].url}`;
            setMyArticleImageUrl(imageUrl);
        }
    }, [myArticleId, props.articleData]);

    useEffect(() => {
        setArticleLoaded(true);
        // console.log('***** Article Loaded: ', myArticle);
    }, [myArticle]);

    return (
        <div>
            <Divider marginTop='20px'/>
            <div className="search-results">
                <Flex height='auto'>
                    <Box className="article-list"width='38%' borderRight='1px' borderColor='brand.200'>
                        <Heading pt='30px' pb='10px' size='md' color="brand.100">NY Times Archive for { props.formData.year } { monthDict[props.formData.month] }</Heading>
                        <form id="select-article">
                            <Select value={myArticle._id} onChange={handleChange} placeholder='Click to Select Article' size='sm' variant='filled' width='50%' paddingBottom='10px' color="brand.100">
                                {props.articleData.map(article => {
                                    return (
                                        <option key={article._id} value={article._id}>
                                            {article.headline.main}
                                        </option>
                                    )
                                })}
                            </Select>
                        </form>
                        { articleLoaded && myArticle.headline &&
                            <VStack spacing='5px' paddingTop='20px' paddingRight='10px' justifyContent='left'>
                                <Input onChange={editHeadline} type="text" id="editheadline" name="editheadline" placeholder="Edit the headline" />
                                <Button type="button" onClick={handleEdit} size='sm' className='button' color="brand.300" bg="brand.100">Edit</Button>
                            </VStack>
                        }
                    </Box>
                    <Box aria-live="polite" className='article-display' width='60%' paddingLeft='15px' bg="brand.200" color="brand.100">
                        { articleLoaded && myArticle.headline ?
                            <>
                                <Heading size='sm' paddingTop='10px'>{myArticle.headline.main}</Heading>
                                <Text className="date">Pub Date: {articleYear} {monthDict[articleMonth]} {articleDay}</Text>
                                <Text className="byline">{myArticle.byline.original}</Text>
                                <br></br>
                                {myArticle.multimedia.length > 4 ? (<Image className="article-image" src={myArticleImageUrl}></Image>) : (<Text>No media.</Text>)}
                                <Text>{myArticle.abstract}</Text>
                                <br></br>
                                <Text>{myArticle.lead_paragraph}</Text>
                                <br></br>
                                <Text>News Desk: {myArticle.news_desk}</Text>
                                <Link textDecoration="underline" href={myArticle.web_url} target="_blank" isExternal>Original Article</Link>
                            </>
                        : <Text paddingTop='10px'>Please select an article.</Text>}
                    </Box>
                </Flex>
                <Text className="copyright" fontSize='sm' marginTop='30px'>All articles are {props.copyright}</Text>
            </div>
        </div>
    );
};

export default SearchResults;
