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
    PanelHeader, Group, Header,
    Cell, Avatar, Progress, FormItem
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {Icon24GameOutline, Icon28NewsfeedOutline, Icon28AddOutline} from "@vkontakte/icons";

import Results from "./Results";

import fireStore from "./DB";
import {collection, doc, updateDoc, getDoc, setDoc, serverTimestamp} from 'firebase/firestore'

const InitialView = () => {


    const [activePanel, setActivePanel] = useState('game')
    const [scheme, setScheme] = useState('bright_light')
    const [fetchedUser, setUser] = useState(null);
    const [percent, setPercent] = useState(70);

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

    useEffect(() => {
        bridge.send('VKWebAppGetUserInfo')
            .then((data) => {
                console.log(data)

                setDoc(doc(fireStore, 'users', data.id.toString()), {
                    bestScore: 0, Name: data.first_name, Surname: data.last_name,
                    lastEnterTime: serverTimestamp(),
                    idVK: data.id
                }).then(docRef => {
                    console.log("Document has been added successfully");
                }).catch(error => {
                    console.log(error);
                });
            })
            .catch((error) => {
                // Ошибка
                console.log(error);
            })
    }, []);


    const lessOrEqual100 = (v, add) => {
        return v + add <= 100 ? v + add : 100
    }


    return (
        <ConfigProvider appearance={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout>

                        <Epic
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

                                    {fetchedUser &&
                                        <Group mode="card">
                                            <Cell
                                                before={fetchedUser.photo_200 ?
                                                    <Avatar src={fetchedUser.photo_200}/> : null}
                                                description={"У вас сейчас 300 очков!"}
                                            >
                                                {`${fetchedUser.first_name} ${fetchedUser.last_name}`}
                                            </Cell>
                                        </Group>
                                    }

                                    {fetchedUser &&
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
                                    }

                                    {fetchedUser &&
                                        <Group mode="plain">
                                            <Cell
                                                // before={fetchedUser.photo_200 ?
                                                //     <Avatar src={fetchedUser.photo_200}/> : null}
                                                description={"А он кста еще и духом сильный!"}
                                                after={<Icon28AddOutline/>}
                                                onClick={() => localStorage.setItem('myCat', 'Tom')}
                                            >
                                                Качалочка
                                            </Cell>

                                            <FormItem id="progresslabel" top="Прогресс: 40%">
                                                <Progress aria-labelledby="progresslabel" value={40}/>
                                            </FormItem>
                                        </Group>
                                    }

                                    {fetchedUser &&
                                        <Group mode="plain">
                                            <Cell
                                                // before={fetchedUser.photo_200 ?
                                                //     <Avatar src={fetchedUser.photo_200}/> : null}
                                                description={"Матеша, блинб"}
                                                after={<Icon28AddOutline/>}
                                                onClick={() => console.log(localStorage.getItem('myCat'))}
                                            >
                                                Учеба
                                            </Cell>

                                            <FormItem id="progresslabel" top="Прогресс: 40%">
                                                <Progress aria-labelledby="progresslabel" value={40}/>
                                            </FormItem>
                                        </Group>
                                    }

                                    {fetchedUser &&
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
                                    }


                                </Panel>
                            </View>

                            <View id={'results'} activePanel={'results'}>
                                <Panel id={'results'}>

                                    <Results/>
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