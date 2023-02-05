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

    const [currentScore, setCurrentScore] = useState(null)

    let firstIn

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
        setDoc(doc(fireStore, 'users', inf.id.toString()), inf).then(docRef => {
            console.log("Information has been added successfully", docRef);
        }).catch(error => {
            // console.error(error)
            throw new Error("Whoops! " + error)
        })
    }


    useEffect(() => {

        if (localStorage.getItem('category1') === undefined || localStorage.getItem('category2') === undefined
            || localStorage.getItem('category3') === undefined || localStorage.getItem('category4') === undefined
            || localStorage.getItem('CurrentScore') === undefined || localStorage.getItem('bestScore') === undefined
            || localStorage.getItem('lastEnterTime') === undefined
            || localStorage.getItem('category1') === null || localStorage.getItem('category2') === null
            || localStorage.getItem('category3') === null || localStorage.getItem('category4') === null
            || localStorage.getItem('currentScore') === null || localStorage.getItem('bestScore') === null
            || localStorage.getItem('lastEnterTime') === null){

            localStorage.setItem('category1', 70)
            localStorage.setItem('category2', 70)
            localStorage.setItem('category3', 70)
            localStorage.setItem('category4', 70)
            localStorage.setItem('currentScore', 0)
            localStorage.setItem('bestScore', 0)
            localStorage.setItem('lastEnterTime', new Date())

            firstIn = true
        } else {
            firstIn = false
        }

        bridge.send('VKWebAppGetUserInfo')
            .then((data) => {
                // RECIVE AND SEND
                const q = query(collection(fireStore, "users"), where("id", "==", data.id))
                // const q = query(collection(fireStore, "users"), where("bestScore", "==", 0))

                reciveData(q).then(inf => {
                    if (inf.length === 1) {
                        let serverBestScore = inf[0].data().bestScore

                        console.error(data.id, localStorage.getItem("bestScore"), localStorage.getItem("a"))

                        if (serverBestScore < localStorage.getItem('bestScore')){
                            sendData({
                                first_name: inf[0].data().first_name,
                                last_name: inf[0].data().last_name,
                                bestScore: Number(localStorage.getItem('bestScore')),
                                id: inf[0].data().id
                            })
                        }
                    } else {

                        console.error("First sing person", inf.length)
                        console.error(data.id, localStorage.getItem("bestScore"))

                        sendData({
                            first_name: data.first_name,
                            last_name: data.last_name,
                            bestScore: Number(localStorage.getItem('bestScore')),
                            id: data.id
                        })
                        console.error("First sing person2")

                    }

                }).catch(error => {
                    throw new Error("Whoops! " + error)
                })


            }).catch((error) => {
                throw new Error("Whoops! " + error)
        })


        setCategory1(localStorage.getItem('category1'))
        setCategory2(localStorage.getItem('category2'))
        setCategory3(localStorage.getItem('category3'))
        setCategory4(localStorage.getItem('category4'))

        setCurrentScore(localStorage.getItem('currentScore'))



        setPopout(null)




    }, [])


    const Bw0and100 = (v, step) => {
        v = Number(v)
        if (v + step <= 100 && v + step >= 0)
            return v + step
        else if (v + step < 0)
            return 0
        else if (v + step > 100)
            return 100
    }

    const updateStorage = () => {
        localStorage.setItem('category1', category1)
        localStorage.setItem('category2', category2)
        localStorage.setItem('category3', category3)
        localStorage.setItem('category4', category4)

        localStorage.setItem('currentScore', currentScore)

        if (bestScore < currentScore)
            localStorage.setItem('bestScore', currentScore)

        localStorage.setItem('lastEnterTime', new Date())
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
                                            onClick={
                                                () => {
                                                    setCategory1(Bw0and100(category1, 2))
                                                    updateStorage()
                                                }
                                            }
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
                                            onClick={
                                                () => {
                                                    setCategory2(Bw0and100(category2, 2))
                                                    updateStorage()
                                                }
                                            }
                                        >
                                            Качалочка
                                        </Cell>

                                        <FormItem id="progresslabel" top={`Прогресс: ${category2}%`}>
                                            <Progress aria-labelledby="progresslabel" value={category2}/>
                                        </FormItem>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Блин, нужно же еще и диплом писать!"}
                                            after={<Icon28AddOutline/>}
                                            onClick={
                                                () => {
                                                    setCategory3(Bw0and100(category3, 2))
                                                    updateStorage()
                                                }
                                            }
                                        >
                                            Учеба
                                        </Cell>

                                        <FormItem id="progresslabel" top={`Прогресс: ${category3}%`}>
                                            <Progress aria-labelledby="progresslabel" value={category3}/>
                                        </FormItem>
                                    </Group>


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Роберт Фаридович будет доволен"}
                                            after={<Icon28AddOutline/>}
                                            onClick={
                                                () => {
                                                    setCategory4(Bw0and100(category4, 2))
                                                    updateStorage()
                                                }
                                            }
                                        >
                                            Участие в мероприятиях
                                        </Cell>

                                        <FormItem id="progresslabel" top={`Прогресс: ${category4}%`}>
                                            <Progress aria-labelledby="progresslabel" value={category4}/>
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