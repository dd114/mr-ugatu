import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    View,
    Panel,
    AdaptivityProvider,
    AppRoot,
    ConfigProvider,
    SplitLayout,
    Epic,
    TabbarItem,
    Tabbar,
    PanelHeader,
    Group,
    ScreenSpinner,
    Cell,
    Avatar,
    Progress,
    FormItem,
    PanelHeaderBack,
    CellButton,
    usePlatform,
    Platform,
    Badge,
    CardGrid,
    Card,
    Header,
    Div
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {
    Icon24GameOutline,
    Icon20BookSpreadOutline,
    Icon28AddOutline,
    Icon24ServicesOutline,
    Icon24ListNumberOutline, Icon28ListOutline, Icon24MoreHorizontal
} from "@vkontakte/icons";


import Results from "./Results";
import СatchingOfThings from "./СatchingOfThings";

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
    // const [popout, setPopout] = useState(<ScreenSpinner state="loading"/>);

    const [category1, setCategory1] = useState(null)
    const [category2, setCategory2] = useState(null)
    const [category3, setCategory3] = useState(null)
    const [category4, setCategory4] = useState(null)

    const [currentScore, setCurrentScore] = useState(null)

    const [catchingOfThings, setCatchingOfThings] = useState("game")

    const platform = usePlatform();


    let firstIn, countDownPerPercent = 10 * 1000

    const onStoryChange = (e) => {
        setActivePanel(e.currentTarget.dataset.story)
    }

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === 'VKWebAppUpdateConfig') {
                setScheme(data.appearance)
            }
        });

        // async function fetchData() {
        //     const user = await bridge.send('VKWebAppGetUserInfo');
        //     setUser(user);
        //     // setPopout(null);
        // }
        //
        // fetchData();
    }, [])

    const reciveData = async (q) => {
        console.log("reciveData has started")

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

    const showStorage = () => {

        console.log("LC STORAGE", localStorage.getItem('category1'))
        console.log("LC STORAGE", localStorage.getItem('category2'))

        console.log("LC STORAGE", localStorage.getItem('category3'))
        console.log("LC STORAGE", localStorage.getItem('category4'))

        console.log("LC STORAGE", localStorage.getItem('currentScore'))
        console.log("LC STORAGE", localStorage.getItem('bestScore'))

        console.log("LC STORAGE", localStorage.getItem('lastEnterTime'))
    }

    useEffect(() => {

        if (localStorage.getItem('category1') === undefined || localStorage.getItem('category2') === undefined
            || localStorage.getItem('category3') === undefined || localStorage.getItem('category4') === undefined
            || localStorage.getItem('CurrentScore') === undefined || localStorage.getItem('bestScore') === undefined
            || localStorage.getItem('lastEnterTime') === undefined
            || localStorage.getItem('category1') === null || localStorage.getItem('category2') === null
            || localStorage.getItem('category3') === null || localStorage.getItem('category4') === null
            || localStorage.getItem('currentScore') === null || localStorage.getItem('bestScore') === null
            || localStorage.getItem('lastEnterTime') === null
            || isNaN(localStorage.getItem('category1')) || isNaN(localStorage.getItem('category2'))
            || isNaN(localStorage.getItem('category3')) || isNaN(localStorage.getItem('category4'))
            || isNaN(localStorage.getItem('currentScore')) || isNaN(localStorage.getItem('bestScore'))
            || isNaN(localStorage.getItem('lastEnterTime'))) {

            localStorage.setItem('category1', 0)
            localStorage.setItem('category2', 0)
            localStorage.setItem('category3', 0)
            localStorage.setItem('category4', 0)
            localStorage.setItem('currentScore', 0)
            localStorage.setItem('bestScore', 0)
            localStorage.setItem('lastEnterTime', Date.now())

            // localStorage.setItem('catchingOfThingsScore', 0)
            localStorage.setItem('catchingOfThingsBestScore', 0)

            firstIn = true
        } else {

            let diff = Math.abs(Date.now() - localStorage.getItem('lastEnterTime'))
            let minusPercent = -Math.floor(diff / countDownPerPercent)

            console.log("localStorage.getItem('lastEnterTime')", localStorage.getItem('lastEnterTime'))
            console.log("diff", diff)
            console.log("diff / countDownPerPercent", diff / countDownPerPercent)
            console.log("minusPercent", minusPercent)

            updateStorage(5, minusPercent)

            firstIn = false
        }

        // showStorage()


        bridge.send('VKWebAppGetUserInfo')
            .then((data) => {

                setUser(data)

                // RECIVE AND SEND
                const q = query(collection(fireStore, "users"), where("id", "==", data.id))
                // const q = query(collection(fireStore, "users"), where("bestScore", "==", 0))

                reciveData(q).then(inf => {
                    if (inf.length === 1) {
                        let serverBestScore = inf[0].data().bestScore

                        console.error(data.id, localStorage.getItem("bestScore"), localStorage.getItem("a"))

                        if (serverBestScore < localStorage.getItem('bestScore')) {
                            sendData({
                                first_name: inf[0].data().first_name,
                                last_name: inf[0].data().last_name,
                                bestScore: Number(localStorage.getItem('bestScore')),
                                id: inf[0].data().id
                            })
                        } else {
                            localStorage.setItem('bestScore', Number(serverBestScore))
                        }

                    } else {

                        console.error("First sing person", inf.length)
                        // console.error(data.id, localStorage.getItem("bestScore"))

                        sendData({
                            first_name: data.first_name,
                            last_name: data.last_name,
                            bestScore: Number(localStorage.getItem('bestScore')),
                            id: data.id
                        })
                        console.error("First sing person2")

                        // Чтобы я мог управлять удалением результата с сервера
                        localStorage.setItem('bestScore', 0)

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


        // setPopout(null)

        setInterval(() => {
            updateStorage(5, -1)
            console.log("setInterval!")
        }, countDownPerPercent)

    }, [])


    const Bw0and100 = (v, step) => {
        v = Number(v)

        if (v + step <= 100 && v + step >= 0)
            return v + step
        else if (v + step < 0)
            return 0
        // else if (v + step > 100)
        return 100
    }

    const Bw0 = (v, step) => {
        v = Number(v)

        if (v + step >= 0)
            return v + step
        else if (v + step < 0)
            return 0
    }

    const updateStorage = (num, add) => {
        let set

        switch (num) {


            case 1:
                set = Bw0and100(Number(localStorage.getItem("category1")), add)
                localStorage.setItem('category1', set)
                setCategory1(set)
                break
            case 2:
                set = Bw0and100(Number(localStorage.getItem("category2")), add)
                localStorage.setItem('category2', set)
                setCategory2(set)
                break
            case 3:
                set = Bw0and100(Number(localStorage.getItem("category3")), add)
                localStorage.setItem('category3', set)
                setCategory3(set)
                break
            case 4:
                set = Bw0and100(Number(localStorage.getItem("category4")), add)
                console.log(Number(localStorage.getItem("category4")), set)
                localStorage.setItem('category4', set)
                setCategory4(set)
                break

            case 5:

                set = Bw0and100(Number(localStorage.getItem("category1")), add)
                localStorage.setItem('category1', set)
                setCategory1(set)

                set = Bw0and100(Number(localStorage.getItem("category2")), add)
                localStorage.setItem('category2', set)
                setCategory2(set)

                set = Bw0and100(Number(localStorage.getItem("category3")), add)
                localStorage.setItem('category3', set)
                setCategory3(set)

                set = Bw0and100(Number(localStorage.getItem("category4")), add)
                localStorage.setItem('category4', set)
                setCategory4(set)
                break
        }

        if (set !== 100 && add > 0) { // можно переписать более красиво
            // console.log("Now 1")
            localStorage.setItem("currentScore", Bw0(Number(localStorage.getItem("currentScore")), add))
            setCurrentScore(localStorage.getItem('currentScore'))
        } else if (add < 0 && ((Number(localStorage.getItem("category1")) === 0) || Number(localStorage.getItem("category2")) === 0
            || Number(localStorage.getItem("category3")) === 0 || Number(localStorage.getItem("category4")) === 0)) {
            // console.log("Now 21", localStorage.getItem('currentScore'))
            localStorage.setItem("currentScore", Bw0(Number(localStorage.getItem("currentScore")), add))
            setCurrentScore(localStorage.getItem('currentScore'))
            // console.log("Now 22", localStorage.getItem('currentScore'))
        }

        if (Number(localStorage.getItem('bestScore')) < Number(localStorage.getItem('currentScore'))) {
            localStorage.setItem('bestScore', Number(localStorage.getItem('currentScore')))

        }

        localStorage.setItem('lastEnterTime', Date.now())


        console.log("category1", Number(localStorage.getItem('category1')))
        console.log("currentScore", Number(localStorage.getItem('currentScore')))
        console.log("bestScore", Number(localStorage.getItem('bestScore')))
    }

    return (
        <ConfigProvider appearance={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={null}>

                        <Epic
                            activeStory={activePanel}
                            tabbar={

                                <Tabbar>
                                    <TabbarItem

                                        onClick={onStoryChange}
                                        selected={activePanel === "game"}
                                        data-story="game"
                                        text="Игра"
                                    >
                                        <Icon24ServicesOutline width={24} height={24}/>
                                    </TabbarItem>

                                    <TabbarItem
                                        onClick={onStoryChange}
                                        selected={activePanel === "results"}
                                        data-story="results"
                                        text="Топ"
                                    >
                                        <Icon28ListOutline width={24} height={24}/>
                                    </TabbarItem>

                                    <TabbarItem
                                        onClick={onStoryChange}
                                        selected={activePanel === "rules"}
                                        data-story="rules"
                                        text="Правила"
                                        indicator={<Badge mode="prominent" aria-label="Надо прочесть"/>}
                                    >
                                        <Icon24MoreHorizontal width={24} height={24}/>
                                    </TabbarItem>
                                </Tabbar>

                            }
                        >

                            <View id={'game'} activePanel={catchingOfThings}>

                                <Panel id={'game'}>
                                    <PanelHeader>Tamagotchi</PanelHeader>


                                    {fetchedUser && <Group mode="card">
                                        <Cell
                                            before={<Avatar
                                                src={"https://sun3-12.userapi.com/s/v1/ig2/nOpTni7bX_hgwLHb0Nl_u_HDE7-ezKWlOM8LGjll8ccb448jif_WMKkImvMGSVmsUopV3SEr_ovkh2n4plhKI0AP.jpg?size=200x200&quality=95&crop=325,125,1073,1073&ava=1"}/>}
                                            description={`${fetchedUser.first_name}, у вашего мистера сейчас ${currentScore} очков!️ 💋`}
                                            // after={<Icon28LikeFillRed/>}
                                        >
                                            Ваш личный Марсель Нуретдинов 💚
                                        </Cell>
                                    </Group>}


                                    <Group mode="plain">
                                        <Cell
                                            // before={fetchedUser.photo_200 ?
                                            //     <Avatar src={fetchedUser.photo_200}/> : null}
                                            description={"Нужно упорно репетировать..."}
                                            after={<Icon28AddOutline/>}
                                            onClick={
                                                () => {

                                                    updateStorage(1, 2)
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
                                                    updateStorage(2, 2)
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
                                                    updateStorage(3, 2)
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
                                            after={<Icon24GameOutline/>}
                                            onClick={
                                                () => {
                                                    setCatchingOfThings("catchingOfThings")
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

                                <Panel id="catchingOfThings">

                                    <СatchingOfThings setCatchingOfThings={setCatchingOfThings}
                                                      updateStorage={updateStorage}/>


                                </Panel>
                            </View>

                            <View id={'results'} activePanel={'results'}>
                                <Panel id={'results'}>

                                    {fetchedUser && <Results sendData={sendData} userInfo={fetchedUser}
                                                             reciveData={reciveData}/>}
                                </Panel>
                            </View>

                            <View id={'rules'} activePanel={'rules'}>
                                <Panel id={'rules'}>
                                    <PanelHeader>Правила</PanelHeader>
                                    <Group mode="plain"
                                           header={<Header mode="secondary">Играл в Тамагочи?</Header>}
                                    >
                                        <CardGrid size="l">
                                            <Card>

                                                <div style={{height: 15}}/>
                                                1) Прокачка Марселя состоит из нескольких этапов, где первые 3
                                                прокачиваются кликами, последняя же "участием" в университетских
                                                мероприятиях, за каждый из них дается 1 балл.
                                                <Div/>
                                                2) При пропуске 5 мероприятий, игра оканчивается, но можно начать еще
                                                раз
                                                <Div/>
                                                3) Каждые {countDownPerPercent / 1000} секунд (даже если ты не
                                                пользуешься приложением) уменьшается каждый из показателей на 1%,
                                                поэтому нужно следить за вашем мистером, иначе если он упадет до нуля,
                                                то текущий балл уменьшается
                                                <Div/>
                                                4) Лучшие 50 тостигнутых результатов войдут в топ лист
                                                <div style={{height: 15}}/>

                                            </Card>
                                        </CardGrid>
                                    </Group>

                                </Panel>

                            </View>


                        </Epic>


                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    )
}

export default InitialView