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
    const [fetchedUser, setUser] = useState(null);
    const [percent, setPercent] = useState(70);

    const [popout, setPopout] = useState(<ScreenSpinner state="loading"/>);

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

    let lastScore = null, bestScore = null, lastEnterTime = null, currentScore = null
    let userInfo = null

    useEffect(() => {
        bridge.send('VKWebAppGetUserInfo')
            .then((data) => {
                userInfo = data

                // RECIVE AND SEND
                const q = query(collection(fireStore, "users"), where("idVK", "!=", userInfo.id))
                // const q = query(collection(fireStore, "users"), where("bestScore", "==", 0))
                reciveData(q).then(inf => {
                    if (inf.length === 1) {
                        lastScore = inf[0].data().lastScore
                        bestScore = inf[0].data().bestScore
                        lastEnterTime = inf[0].data().lastEnterTime

                        // console.log("From Db inf", lastScore, bestScore, lastEnterTime)
                    } else {
                        currentScore = 0

                        sendData({
                            bestScore: 0, Name: userInfo.first_name, Surname: userInfo.last_name,
                            // lastEnterTime: serverTimestamp(),
                            lastEnterTime: Date.now(),
                            idVK: userInfo.id, lastScore: currentScore
                        })

                        console.error(`inf.length = ${inf.length}`)

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
                                            description={"У вас и вашего мистера сейчас 300 очков!️ 💋"}
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
                                            onClick={() => setPercent(lessOrEqual100(percent, 2))}
                                        >
                                            Репетиция в авангарде
                                        </Cell>

                                        <FormItem id="progresslabel" top={`Прогресс: ${percent}%`}>
                                            <Progress aria-labelledby="progresslabel" value={percent}/>
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