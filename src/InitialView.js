import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    View,
    Panel,
    AdaptivityProvider,
    AppRoot,
    ConfigProvider,
    SplitLayout,
    Epic, TabbarItem, Tabbar,
    PanelHeader, Group, ScreenSpinner,
    Cell, Avatar, Progress, FormItem
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {Icon24GameOutline, Icon28NewsfeedOutline, Icon28AddOutline, Icon28LikeFillRed} from "@vkontakte/icons";


import Results from "./Results";

import fireStore from "./DB";
import {
    collection,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    setDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from 'firebase/firestore'

const InitialView = () => {


    const [activePanel, setActivePanel] = useState('game')
    const [scheme, setScheme] = useState('bright_light')
    const [fetchedUser, setUser] = useState(null)
    const [popout, setPopout] = useState(<ScreenSpinner state="loading"/>);

    const [category1, setCategory1] = useState(null)
    const [category2, setCategory2] = useState(null)
    const [category3, setCategory3] = useState(null)
    const [category4, setCategory4] = useState(null)

    const onStoryChange = (e) => {
        setActivePanel(e.currentTarget.dataset.story)
    }

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === 'VKWebAppUpdateConfig') {
                setScheme(data.appearance)
            }
        });

        async function fetchData() {
            const user = await bridge.send('VKWebAppGetUserInfo');
            setUser(user);
            // setPopout(null);
        }

        fetchData();
    }, []);

    const reciveData = async (q) => {

        const inf = []

        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            inf.push(doc)
        })

        // console.log(inf)
        return inf
    }

    const sendData = (inf) => {
        setDoc(doc(fireStore, 'users', inf.idVK.toString()), inf).then(docRef => {
            console.log("Information has been added successfully", docRef);
        }).catch(error => {
            // console.error(error)
            throw new Error("Whoops! " + error)
        })
    }


    useEffect(() => {
        bridge.send('VKWebAppGetUserInfo')
            .then((data) => {
                // RECIVE AND SEND
                const q = query(collection(fireStore, "users"), where("idVK", "!=", data.id))
                // const q = query(collection(fireStore, "users"), where("bestScore", "==", 0))
                reciveData(q).then(inf => {
                    if (inf.length === 1) {
                        let tempLastScore = inf[0].data().lastScore
                        let tempBestScore = inf[0].data().bestScore
                        let tempLastEnterTime = inf[0].data().lastEnterTime

                        let tempCategory1 = inf[0].data().category1
                        let tempCategory2 = inf[0].data().category2
                        let tempCategory3 = inf[0].data().category3
                        let tempCategory4 = inf[0].data().category4

                        if (localStorage.getItem('category1')  <= tempCategory1 && localStorage.getItem('category2') <= tempCategory2
                            && localStorage.getItem('category3') <= tempCategory3 && localStorage.getItem('category4') <= tempCategory4){

                            localStorage.setItem('category1', tempCategory1)
                            localStorage.setItem('category2', tempCategory2)
                            localStorage.setItem('category3', tempCategory3)
                            localStorage.setItem('category4', tempCategory4)

                            setCategory1(localStorage.getItem('category1'))
                            setCategory2(localStorage.getItem('category2'))
                            setCategory3(localStorage.getItem('category3'))
                            setCategory4(localStorage.getItem('category4'))

                        } else{
                            sendData({
                                category1: localStorage.getItem('category1'),
                                category2: localStorage.getItem('category2'),
                                category3: localStorage.getItem('category3'),
                                category4: localStorage.getItem('category4'),
                                lastScore: tempLastScore,
                                idVK: data.id
                            })
                        }

                    } else {

                        localStorage.setItem('category1', 70)
                        localStorage.setItem('category2', 70)
                        localStorage.setItem('category3', 70)
                        localStorage.setItem('category4', 70)

                        setCategory1(localStorage.getItem('category1'))
                        setCategory2(localStorage.getItem('category2'))
                        setCategory3(localStorage.getItem('category3'))
                        setCategory4(localStorage.getItem('category4'))

                        sendData({
                            category1: localStorage.getItem('category1'),
                            category2: localStorage.getItem('category2'),
                            category3: localStorage.getItem('category3'),
                            category4: localStorage.getItem('category4'),
                            lastScore: 0, bestScore: 0, idVK: data.id
                        })

                        console.error("First sing person")

                    }

                }).catch(error => {
                    throw new Error("Whoops! " + error)
                })


            }).catch((error) => {
                throw new Error("Whoops! " + error)
        })


        setPopout(null)




    }, [])


    const lessOrEqual100 = (v, add) => {
        return v + add <= 100 ? v + add : 100
    }


    return (
        <ConfigProvider appearance={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout}>

                        {!popout && <Epic
                            activeStory={activePanel}
                            tabbar={

                                <Tabbar>
                                    <TabbarItem

                                        onClick={onStoryChange}
                                        selected={activePanel === "game"}
                                        data-story="game"
                                        text="Game"
                                    >
                                        <Icon24GameOutline/>
                                    </TabbarItem>
                                    <TabbarItem
                                        onClick={onStoryChange}
                                        selected={activePanel === "results"}
                                        data-story="results"
                                        text="Top"
                                    >
                                        <Icon28NewsfeedOutline/>
                                    </TabbarItem>
                                </Tabbar>

                            }
                        >

                            <View id={'game'} activePanel={'game'}>

                                <Panel id={'game'}>
                                    <PanelHeader>Tamagotchi</PanelHeader>


                                    <Group mode="card">
                                        <Cell
                                            before={<Avatar
                                                src={"https://sun3-12.userapi.com/s/v1/ig2/nOpTni7bX_hgwLHb0Nl_u_HDE7-ezKWlOM8LGjll8ccb448jif_WMKkImvMGSVmsUopV3SEr_ovkh2n4plhKI0AP.jpg?size=200x200&quality=95&crop=325,125,1073,1073&ava=1"}/>}
                                            description={fetchedUser && `${fetchedUser.first_name}, у вашего мистера сейчас 300 очков!️ 💋`}
                                            // after={<Icon28LikeFillRed/>}
                                        >
                                            Ваш личный Марсель Нуретдинов 💚
                                        </Cell>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Нужно упорно репетировать..."}
                                            after={<Icon28AddOutline/>}
                                            onClick={() => setPercent(lessOrEqual100(category1, 2))}
                                        >
                                            Репетиция в авангарде
                                        </Cell>

                                        <FormItem id="progresslabel" top={`Прогресс: ${category1}%`}>
                                            <Progress aria-labelledby="progresslabel" value={category1}/>
                                        </FormItem>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"А он еще и духом сильный!"}
                                            after={<Icon28AddOutline/>}
                                            onClick={() => localStorage.setItem('myCat', 'Tom')}
                                        >
                                            Качалочка
                                        </Cell>

                                        <FormItem id="progresslabel" top="Прогресс: 40%">
                                            <Progress aria-labelledby="progresslabel" value={40}/>
                                        </FormItem>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Блин, нужно же еще и диплом писать!"}
                                            after={<Icon28AddOutline/>}
                                            onClick={() => console.log(localStorage.getItem('myCat'))}
                                        >
                                            Учеба
                                        </Cell>

                                        <FormItem id="progresslabel" top="Прогресс: 40%">
                                            <Progress aria-labelledby="progresslabel" value={40}/>
                                        </FormItem>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Роберт Фаридович будет доволен"}
                                            after={<Icon28AddOutline/>}
                                        >
                                            Участие в мероприятиях
                                        </Cell>

                                        <FormItem id="progresslabel" top="Прогресс: 40%">
                                            <Progress aria-labelledby="progresslabel" value={40}/>
                                        </FormItem>
                                    </Group>


                                </Panel>
                            </View>

                            <View id={'results'} activePanel={'results'}>
                                <Panel id={'results'}>

                                    <Results/>
                                </Panel>
                            </View>

                        </Epic>}


                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    )
}

export default InitialView