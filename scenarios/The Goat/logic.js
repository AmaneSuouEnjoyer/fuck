function createEnding(engine, results) {
    const erdoganId = 33650;
    const kilicdarogluId = 33651;
    const sinanOganId = 33655;
    const playerId = engine.getPlayerCandidateController().getId();
    
    // Get vote percentages for all candidates
    const erdoganPvs = results.popularVotes.get(erdoganId);
    const kilicdarogluPvs = results.popularVotes.get(kilicdarogluId);
    const sinanOganPvs = results.popularVotes.get(sinanOganId);
    const totalPvs = results.totalPopularVotes;
    
    const erdoganPercentage = erdoganPvs / totalPvs;
    const kilicdarogluPercentage = kilicdarogluPvs / totalPvs;
    const sinanOganPercentage = sinanOganPvs / totalPvs;
    
    // ENDINGS WHEN PLAYER IS ERDOĞAN
    if (playerId === erdoganId) {
        
        // Ending 1: Erdogan wins more than 50%
        if (erdoganPercentage > 0.50) {
            engine.setNewMusic([  // ← MUSIC CODE GOES HERE
        {
            displayName: "Dombra",
            imageUrl: "https://i.ytimg.com/vi/kddlMQAWHqU/maxresdefault.jpg",
            url: "https://ia600802.us.archive.org/0/items/onur-akin-geliyor-kilicdaroglu-yeni-versiyon/Dombra.mp3",
        }
    ]);
            return {
                slides: [
                    {
                        imageUrl: "https://static.bianet.org/system/uploads/1/articles/spot_image/000/279/496/original/erdogan-yedili-balkon-aa-1.jpg",
                        endingHeader: "The Century of Turkey Begins",
                        endingText: "Standing on the legendary balcony of the AK Party headquarters, you look down at a crowd of hundreds of thousands. You have not just won an election; you have defeated a unified opposition, survived an economic crisis, and proven that the 'National Will' remains firmly in your grip. Your critics called your spending 'bribes,' but tonight, the people called it 'justice.' With a crushing parliamentary majority also secured, the checks and balances are gone. You are no longer just a President; you are the undisputed architect of the Century of Turkey. 'The only winner tonight is not me, it is Turkey! My nation has given the necessary answer to those who take orders from Qandil and Pennsylvania. They said 'Bay Bay Kemal' (Bye Bye Kemal), and the nation sent him home. Now, we leave the bickering behind. We have a world to lead and a century to build!"
                    }
                ]
            }
        }
        
        // Ending 2: Sinan Oğan wins more than 50%
        if (sinanOganPercentage > 0.50) {
            return {
                slides: [
                    {
                        imageUrl: "https://cdn.img.anlatilaninotesi.com.tr/img/07e7/05/01/1070462206_0:0:3640:2048_1920x0_80_0_0_5890358b3e620901cbb9f57febdb5ff1.jpg",
                        endingHeader: "The Nationalist Wave Consumes the Palace",
                        endingText: "The unthinkable has happened. The 'Third Way' has become the only way. Sinan Oğan, the academic-politician who built his campaign on a single, iron-clad promise, 'The refugees will go, and the terror-supporters will be purged', has won. Your 21-year era has been brought to an end not by the 'secularists' of the CHP, but by a nationalist firestorm that accused you of being 'too soft' on border security and 'too transactional' with your alliances. You sit in the Presidential Library, watching the results. Oğan has captured the youth, the military-leaning nationalists, and the 'protest' voters of the Anatolian heartland. The 'National Will' you frequently invoked has turned into a nationalist fist. For the first time, you are preparing to hand over the keys of the Presidential Complex to a man who considers your 'normalization' with certain Kurdish factions and your 'Open Door' refugee policy as national treason. 'My nation has spoken, and its word is final. We have built the 'Century of Turkey' for 21 years; we have filled this land with bridges, airports, and domestic weapons. It seems the people now want a different sentinel for these borders. We respect the decision of the box. We are leaving a strong Turkey to Mr. Oğan. Let us hope he can protect what we have built without burning the bridges we've laid.'"
                    }
                ]
            }
        }

        // Ending 3: Kilicdaroglu wins more than 50%
        if (kilicdarogluPercentage > 0.50) {
            engine.setNewMusic([  // ← MUSIC CODE GOES HERE
        {
            displayName: "Kılıçdaroğlu coming",
            imageUrl: "https://i.ytimg.com/vi/A6qdqhRS_7c/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC4AOKAgwIABABGH8gEygVMA8=&rs=AOn4CLBsrNRjgx9RYJCx-E0tc6FBWp7Lpw",
            url: "https://ia600802.us.archive.org/0/items/onur-akin-geliyor-kilicdaroglu-yeni-versiyon/Onur%20Akin%20-%20Geliyor%20Kilicdaroglu%20%28Yeni%20Versiyon%29.mp3",
        }
    ]);
            return {
                slides: [
                    {
                        imageUrl: "https://yurtsever.org.tr/wp-content/uploads/2017/09/ERDOreferandum.jpg",
                        endingHeader: "The National Will Has Spoken",
                        endingText: "The television screens turn orange, then red. For the first time since 2002, the Adam (The Man) has fallen. Kemal Kılıçdaroğlu has crossed 50.1%, and the Supreme Election Council confirms the result. A heavy silence hangs over the Presidential Complex in Beştepe. Your advisors are whispering about 'irregularities' and 'appeals,' but the margin is too wide to bridge. You walk out onto the balcony one last time. The crowd is smaller, their faces nervous. You don't scream; you don't mock. You speak with the heavy, rhythmic tone of a man who knows he is entering the history books as a former leader. You have spent your life saying 'The National Will is supreme' and tonight, you are forced to prove you meant it. 'We came to power with the approval of our people, and if our people have changed their minds, we will do what democracy requires. We do not recognize any power above the National Will. Although we are saddened by this result, we will not be among those who disrespect the decision of the casket. We have served this nation for 21 years with love; we leave it with our heads held high.'"
                    }
                ]
            }
        }
        
        // Ending 4: Erdogan won less than 50% but still more than Kilicdaroglu
        if (erdoganPercentage < 0.50 && erdoganPercentage > kilicdarogluPercentage) {
            return {
                slides: [
                    {
                        imageUrl: "https://worldturk.com.tr/wp-content/uploads/2023/05/ekran-resmi-2023-05-28-202418.png",
                        endingHeader: "Not Finished, Just Beginning",
                        endingText: "The first round of the May 14, 2023 election has concluded. You fell just short of the 50% threshold needed to end it tonight, but the result is a massive psychological victory. While the opposition promised a 'Spring' and a first-round knockout, you finished ahead of Kemal Kılıçdaroğlu. Even more critically, your People's Alliance has secured a solid majority in Parliament. At 2:00 AM, you step onto the balcony of the AK Party headquarters in Ankara. The atmosphere is not one of a 'draw,' but of a pending triumph. You have the momentum, the parliamentary lead, and the nationalist 'kingmaker' candidate Sinan Oğan is already signaling a shift toward your side. The opposition is in disarray, arguing over who miscalculated the numbers. You have two weeks to finish the job. 'Whether the final result shows the election is over or that it has moved to a second round, the winner is already our nation! If our people have chosen to take this to a second round, that decision is welcome. We are already far ahead of our closest rival. On May 28, we will finish what we started and begin the 'Century of Turkey' together!'"
                    }
                ]
            }
        }
        
        // Ending 5: Erdogan won less than 50%, less than Kilicdaroglu, but more than 40%
        if (erdoganPercentage < 0.50 && erdoganPercentage < kilicdarogluPercentage) {
            return {
                slides: [
                    {
                        imageUrl: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/C670/production/_87000805_87000804.jpg",
                        endingHeader: "A Test of Fire",
                        endingText: "The numbers on the screen are cold and unforgiving. For the first time in twenty years, you are the underdog. The opposition is already celebrating in the streets, claiming 'The Spring has come.' Your advisors are in a panic, but you know that a wounded lion is at its most dangerous. You walk onto the balcony. The crowd is smaller, quieter, and looking for a sign of strength. You don't concede; you pivot. You frame this not as a defeat, but as a 'divine warning' and a call to a holy struggle. You have 14 days to convince the nation that a Kılıçdaroğlu presidency would be a descent into chaos and 'terrorist-backed' instability. 'We did not get the result we hoped for, but there is a blessing in every outcome. The will of the people has manifested itself at the ballot box, and we recognize no power above it. We will courageously engage in self-criticism. We are not finished; this is a turning point. We have 14 days to tell our people the truth. Do not be discouraged, the real struggle begins now!'"
                    }
                ]
            }
        }
    }

    // ENDINGS WHEN PLAYER IS KILÎÇDAROĞLU
    else if (playerId === kilicdarogluId) {
        
        // Ending 1: Kılıçdaroğlu wins more than 50%
        if (kilicdarogluPercentage > 0.50) {
            engine.setNewMusic([  // ← MUSIC CODE GOES HERE
        {
            displayName: "Kılıçdaroğlu coming",
            imageUrl: "https://i.ytimg.com/vi/A6qdqhRS_7c/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC4AOKAgwIABABGH8gEygVMA8=&rs=AOn4CLBsrNRjgx9RYJCx-E0tc6FBWp7Lpw",
            url: "https://ia600802.us.archive.org/0/items/onur-akin-geliyor-kilicdaroglu-yeni-versiyon/Onur%20Akin%20-%20Geliyor%20Kilicdaroglu%20%28Yeni%20Versiyon%29.mp3",
        }
    ]);
            return {
                slides: [
                    {
                        imageUrl: "https://static.bianet.org/system/uploads/1/images/000/129/868/original/kemal2-3.jpg",
                        endingHeader: "The Calm Revolution",
                        endingText: "It is 11:30 PM. The final data from large cities like Istanbul, Ankara, and Izmir has flooded the system. The 'Anatolian Fortress' of the government held, but the crushing economic weight and the desire for change among 5 million first-time voters proved stronger. The 'impossible' has happened. For the first time in over two decades, the seat of power is changing hands without a second round. There are no fireworks at the Palace. Instead, there is a profound, heavy silence across the capital as the transition of power begins. 'My dear nation... Today, no one lost. 85 million people won. We are ending the era of polarization. I am not the President of a party; I am the President of the Republic of Turkey. I promised you spring, and look... spring has finally come.'"
                    }
                ]
            }
        }
        
        // Ending 2: Kılıçdaroğlu won less than 50% but better than Erdoğan
        if (kilicdarogluPercentage < 0.50 && kilicdarogluPercentage > erdoganPercentage) {
            return {
                slides: [
                    {
                        imageUrl: "https://bizimtv.com.tr/d/news/98059.jpg",
                        endingHeader: "The Final Sprint",
                        endingText: "It is 2:00 AM. The data flow from the Supreme Election Council (YSK) has finally solidified. You have surpassed Erdoğan, but the presence of Sinan Oğan has denied anyone an absolute majority. For the first time in Turkish history, a Presidential election is going to a Runoff. You have broken the 20-year 'invincibility' of the incumbent. You enter the second round with the mathematical lead and the psychological upper hand. However, the next 14 days will be a brutal fight for the 'nationalist' swing voters that holds the key to the Palace. 'If our nation says 'second round,' it is our duty to accept it. We will win in the second round, absolutely win. Everyone will see it. Erdoğan, despite all his slanders and insults, did not get the vote of confidence he expected from the people. Do not lose hope. We are just getting started.'"
                    }
                ]
            }
        }
        
        // Ending 3: Kılıçdaroğlu won less than 50% and less than Erdoğan
        if (kilicdarogluPercentage < 0.50 && kilicdarogluPercentage < erdoganPercentage && erdoganPercentage < 0.50) {
            return {
                slides: [
                    {
                        imageUrl: "https://static.bianet.org/system/uploads/1/articles/spot_image/000/278/823/original/k%C4%B1l%C4%B1c-2.jpg",
                        endingHeader: "The Narrow Gap",
                        endingText: "It is late into the night, almost morning on May 15. The frantic energy of 'We are ahead' has cooled into a sober, mathematical reality. The High Election Board (YSK) data is final for the first round. The pollsters were wrong, Erdoğan’s base did not collapse, but you have successfully denied him the 50% he needed to stay in the Palace tonight. You are trailing. The fate of the Republic now rests on the 'Runoff' (Second Round) scheduled for May 28. The nationalist block led by Sinan Oğan has become the 'kingmaker,' and the gap is narrow enough that every single vote in the next 14 days is a matter of life and death for the campaign. 'I am here! I am here! You are here too. I will fight until the end. We will win this together. Erdoğan has failed to get the vote of confidence from the people. Do not fall into despair. Do not bow your heads. We will stand tall and we will take this country back in the second round.'"
                    }
                ]
            }
        }
        
        // Ending 4: Erdoğan won more than 50%
        if (erdoganPercentage > 0.50) {
            engine.setNewMusic([  // ← MUSIC CODE GOES HERE
        {
            displayName: "Dombra",
            imageUrl: "https://i.ytimg.com/vi/kddlMQAWHqU/maxresdefault.jpg",
            url: "https://ia600802.us.archive.org/0/items/onur-akin-geliyor-kilicdaroglu-yeni-versiyon/Dombra.mp3",
        }
    ]);
            return {
                slides: [
                    {
                        imageUrl: "https://image.hurimg.com/i/hurriyet/90/750x422/55eb30a0f018fbb8f8b12bbb.jpg",
                        endingHeader: "The 'Last Exit' Defeat",
                        endingText: "It is 4:00 AM on May 15. The final data has been processed by the Supreme Election Council (YSK). The 'Öndeyiz' (We are ahead) tweets and the optimistic briefings by the mayors have hit a brick wall of reality. While you fought a historic campaign, the rural heartland and the nationalist base consolidated behind the incumbent in a way the polls simply didn't see coming. The election is over. There is no second round. There is no 'spring.' The era of the 'Nation Alliance' has ended in a silent, crushing blow. 'My dear nation, do not be sad. I did not want this result for myself; I wanted it for your children, for your freedom. I fought for your right to breathe. We have a difficult road ahead of us. My fight for democracy will continue as long as I have breath in my body. I am here, and I will not leave you alone.'"
                    }
                ]
            }
        }
    }

    // Fallback ending
    return {
        slides: [
            {
                imageUrl: "https://placecats.com/500/500",
                endingHeader: "Error",
                endingText: "Unable to determine ending."
            }
        ]
    }
}

function onAnswerPicked(engine, answerPicked) {
}

function onScenarioStarted(engine) {
}

export { onScenarioStarted, createEnding, onAnswerPicked }