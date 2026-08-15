function createEnding(engine, results) {
    const cand216Id = 216;
    const cand217Id = 217;
    const cand221Id = 221;
    const cand222Id = 222; // Morse – runs only when LBJ + Wallace
    
    const playerId = engine.getPlayerCandidateController().getId();
    const runningMateId = engine.runningMateId;
    
    // Get Electoral Votes for all candidates
    const cand216Evs = results.electoralVotes.get(cand216Id) || 0;
    const cand217Evs = results.electoralVotes.get(cand217Id) || 0;
    const cand221Evs = results.electoralVotes.get(cand221Id) || 0;
    const cand222Evs = results.electoralVotes.get(cand222Id) || 0;
    
    const evThreshold = 270;

    // ---------- Determine the winner (if any) ----------
    let winnerId = null;
    let winnerEvs = 0;
    if (cand216Evs >= evThreshold) {
        winnerId = cand216Id;
        winnerEvs = cand216Evs;
    } else if (cand217Evs >= evThreshold) {
        winnerId = cand217Id;
        winnerEvs = cand217Evs;
    } else if (cand221Evs >= evThreshold) {
        winnerId = cand221Id;
        winnerEvs = cand221Evs;
    }

    // ---------- Helper: victory category ----------
    let winCategory = '';
    if (winnerEvs >= 300) winCategory = 'landslide';
    else if (winnerEvs > 280) winCategory = 'solid';
    else if (winnerEvs >= evThreshold) winCategory = 'narrow';

    // ---------- Set ending image ----------
    let endingImage = "https://placehold.co/600x400"; // default / placeholder
    
    // 1. DEADLOCK
    if (winnerId === null) {
        endingImage = "https://www.floridamemory.com/fpc/TD/TD01737hh.jpg";
    }
    // 2. PLAYER-SPECIFIC LOSSES
    else if (playerId === cand217Id && winnerId !== cand217Id) {
        // Bryant loses
        endingImage = "https://www.floridamemory.com/fpc/political/pt00352.jpg";
    }
    else if (playerId === cand221Id && winnerId !== cand221Id) {
        // Sanders loses – tragic Colonel image
        endingImage = "https://www.mashed.com/img/gallery/the-tragic-real-life-story-of-colonel-sanders/he-had-a-hard-time-holding-down-a-job-1534107045.jpg";
    }
    else if (playerId === cand216Id && winnerId !== cand216Id) {
        // LBJ loses – NYT Vietnam image
        endingImage = "https://static01.nyt.com/images/2018/03/25/sunday-review/25Vietnam-Logevall/25Vietnam-Logevall-superJumbo.jpg";
    }
    // 3. WINNER-BASED IMAGES
    else if (winnerId === cand216Id) {
        // LBJ wins
        endingImage = "https://lbj-new-assets.s3.amazonaws.com/styles/artifact_square/s3/artifacts/images/2018-07/60-7-171c_07151960.jpg";
    }
    else if (winnerId === cand221Id) {
        // Sanders wins – new victory image
        endingImage = "https://archive.org/download/gettyimages-883212460-2048x2048/gettyimages-883212460-2048x2048.jpg";
    }
    else if (winnerId === cand217Id) {
        // Bryant wins – Cloudinary image
        endingImage = "https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_3840,h_1920,g_auto/dpr_auto/f_auto/q_auto:eco/v1/1-gettyimages-460589916?_a=BAVMn6DY0";
    }

    // ==========================================
    // 1. DEADLOCK (no one reaches 270)
    // ==========================================
    if (winnerId === null) {
        // UNIFIED HEADER FOR ALL DEADLOCKS (may be overridden below)
        let header = "BRYANT HOLDS THE KEYS!";
        let text = "";

        if (playerId === cand221Id) {
            // ----- SANDERS DEADLOCK LORE -----
            const baseSpeech = `The Electoral College is deadlocked. You didn't lose, but you didn't win either. And given the year Lyndon Johnson has had with two wars, a recession, riots, and a party that split in two, any halfway competent Republican should have swept this election. Instead, the presidency is heading to the House of Representatives because the Grand Old Party bet its future on a chicken salesman who couldn't close the deal. At least that's what your detractors say. <p>The knives are already out. Goldwater's people are saying they told you so. Rockefeller's donors are muttering that their man would have won in a landslide. Even your own staff is wondering if you peaked too soon. The presidency is still within reach, but you'll have to fight for it in a Congress that barely knows you, with a party that's already practicing its "I told you so" speeches.`;
            
            let rmSuffix = '';
            if (runningMateId === 218) {
                rmSuffix = `<p>To make matters worse, Scranton isn't really trusted by Bryant, who made his electors sign a pledge to choose his supported candidate in the December electoral count. This means that depending on third-party electors will be very difficult. Furthermore, Democrats control both houses of Congress, and LBJ is a master at gathering up different groups to support him in the legislative arena.`;
            } else if (runningMateId === 223) {
                rmSuffix = `<p>Bryant made his electors sign a pledge to choose his supported candidate in the December electoral count, but this doesn't matter to you, since your running mate makes your ticket obnoxious to the likes of Bryant and other conservatives. With that said, Smith has put forward the idea of an alliance between you and LBJ, to make sure Bryant and the Dixiecrats in Congress don't have any influence in the election. It is a wild-sounding suggestion, but a possibility nevertheless.`;
            } else if (runningMateId === 224) {
                rmSuffix = `<p>Bryant made his electors sign a pledge to choose his supported candidate in the December electoral count, and this could be a goldmine for you. Curtis, even while supporting LBJ's Civil Rights Act, is still seen as about as close to Bryant as a Republican can get. On issues such as immigration, he and Bryant can come together, and you could win the election with his electors.`;
            }
            text = baseSpeech + rmSuffix;
        } else if (playerId === cand216Id) {
            // ----- LBJ DEADLOCK LORE -----
            const baseSpeech = `You didn't win, but you didn't lose either. The Electoral College is deadlocked, and for the first time in generations, the presidency will be decided by the House of Representatives. At least that's what they say, but you know the reality: Bryant made his electors sign a pledge to commit their choices to whoever he supports. This means that he can make you or Sanders win the election. Nevertheless, considering the year you've had with two wars, a recession, riots in the streets, and a party that tried to throw you overboard, the fact that you're still standing is a miracle. Now the real fight begins. You'll need every favor you've ever banked and every trick you learned in thirty years on Capitol Hill to navigate the coming storm. But Lyndon Johnson has been counted out before, and he's still here. <p>Rest up, Mr. President.`;
            
            let rmSuffix = '';
            if (runningMateId === 219) {
                rmSuffix = `<p>It will be difficult to make any kind of deal with Bryant while you have the progressive Humphrey as your running mate. You will have to make him shut up to make this work.`;
            } else if (runningMateId === 225) {
                // BASE WALLACE TEXT
                let wallaceText = `<p>Wallace is a Southerner, but it isn't clear how big of a friend he is to the likes of Bryant. Still, linking the immigration issue to the Cuban war could make the nativist Bryant a bit more sympathetic to you. Your selection of Wallace as a running mate is seen as a masterstroke in this regard.`;
                
                // SPECIAL EDGE CASE: Morse (222) got >10 EVs
                if (cand222Evs > 10) {
                    header = "BRYANT AND MORSE HOLD THE KEYS";
                    wallaceText += `<p>With that said, you won't make any deal whatsoever with Morse. He could go to the Sanders side. Be very careful about that.`;
                }
                rmSuffix = wallaceText;
            } else if (runningMateId === 226) {
                rmSuffix = `<p>Well, this isn't good. There is no chance in hell that Bryant will accept any deals with the guy who ran with the 'shoutnik-in-chief', Wayne Morse. Morse is still ambitious, telling you to make a deal with Sanders instead, but the Sanders campaign has already started to meet with Bryant, who has moderated a lot to make sure you and Morse will not be in the White House anytime soon. It was a good run.`;
            }
            text = baseSpeech + rmSuffix;
        } else if (playerId === cand217Id) {
            // ----- BRYANT DEADLOCK LORE -----
            const baseSpeech = `You did it. You didn't win the presidency, but you did something almost as powerful: you took enough electoral votes to control where the election goes. You made your electors sign a pledge that they will throw their support behind the candidate you order them to, so you can make one of the main candidates win during the electoral vote counting in December. Neither Johnson nor Sanders can reach 270 without you.<p>Now the dealmaking begins. You'll likely demand the rollback of the Civil Rights Act, or at least enough of it to let the South run its own affairs again. You'll demand the coasts be closed to Cuban refugees. Whoever wants your support will have to come to you on bended knee. <p>You didn't win the White House, but you might have just won the power to decide who does. The South has a seat at the table again, and you're the one holding the chair. Not bad for a third‑party campaign they all said was finished before it started.`;
            
            let rmSuffix = '';
            if (runningMateId === 220) {
                rmSuffix = `<p>Patterson is earning praise from election analysts because of his populist credentials, and the guy himself is thinking of becoming a more national figure in the aftermath of this election. You might have just gained a strong ally for the future.`;
            } else if (runningMateId === 227) {
                rmSuffix = `<p>Thurmond showed everyone what he has tried to do his whole career: that Dixie shall never be ignored. Even if you can't reach a deal with either of the two candidates, he will make sure things go 'south' in the House.`;
            }
            text = baseSpeech + rmSuffix;
        }

        return {
            slides: [{
                imageUrl: endingImage,
                endingHeader: header,
                endingText: text
            }]
        };
    }

    // ==========================================
    // 2. PLAYER WINS
    // ==========================================
    if (playerId === winnerId) {
        // ----- PLAYER 221 WINS (Colonel Sanders) -----
        if (playerId === cand221Id) {
            // Determine header
            let header = '';
            if (cand221Evs >= 300) {
                header = "THE RECIPE FOR VICTORY: SANDERS BURIES LBJ IN STUNNING LANDSLIDE!";
            } else if (cand221Evs > 280) {
                header = "NEW CHEF IN WASHINGTON!";
            } else {
                header = "SANDERS EDGES OUT LBJ IN THRILLING RACE";
            }
            
            const baseSpeech = `Your political journey began in the 1955 Kentucky gubernatorial election. From there, you went from a sixth-grade dropout selling chicken out of the back of a Ford to the Republican nominee for President of the United States. And now, as expected, you have beaten Lyndon Johnson and sent Farris Bryant back to Florida.<p>The inbox on your new desk is already overflowing. The war in Cuba is still raging, and Camilo Cienfuegos isn't going to lay down his arms just because you won. Indochina is getting worse by the week, and your own generals are warning you not to pull out too fast. Bombs are still going off in Florida. Rioters are still burning down their own neighborhoods. Congress is still controlled by Democrats who think you're an amateur and Republicans who aren't sure you're one of them.<p>But you've faced worse odds. You built a worldwide business from nothing, survived near‑death experiences that would have killed a lesser man, and stared down a would‑be assassin with nothing but a cane and a steady hand. You've got Millie and Harley running the company, Claudia beside you, and a country that's willing to believe again. <p>Congratulations, Mr. President-elect.`;
            
            let rmSuffix = '';
            if (runningMateId === 218) {
                rmSuffix = `<p>Your move of selecting Scranton as your vice president to satisfy the GOP was well received. He did a good job of campaigning across the swing states, and you two are already on good terms.`;
            } else if (runningMateId === 223) {
                rmSuffix = `<p>Despite concerns about her moderate beliefs and her gender, Margaret Chase Smith became the first woman vice president of the United States. Feminist figures whom you have never heard of before in your life are praising both you and her for this historic victory.`;
            } else if (runningMateId === 224) {
                rmSuffix = `<p>It seems like the Goldwater wing of the party had some insight into what they were saying, as the conservative Curtis brought you to victory. Reagan and other conservatives congratulated you with more enthusiasm than you expected.`;
            }
            
            const fullText = baseSpeech + rmSuffix;
            
            return {
                slides: [{
                    imageUrl: endingImage,
                    endingHeader: header,
                    endingText: fullText
                }]
            };
        }

        // ----- PLAYER 216 WINS (LBJ) -----
        else if (playerId === cand216Id) {
            // Determine header
            let header = '';
            if (cand216Evs >= 300) {
                header = "THE COLONEL CRUSHED!";
            } else if (cand216Evs > 280) {
                header = "FOUR MORE YEARS";
            } else {
                header = "LBJ SQUEAKS BY!";
            }
            
            const baseSpeech = `They counted you out. Two wars, a recession, riots in the streets, and a Democratic Party so fractured that half of it was running against you. Every pundit said that Lyndon Johnson of Texas was finished. Even your own advisors were sure you couldn't pull it off. But you did. You clawed back from the brink and proved that the Ranchman still had one more fight in him. <p>Now the real work begins. Cuba is still bleeding, Indochina is getting worse, and the cities could go up in flames again at any moment. Your own party is held together with baling wire and spite. And every promise you made in the campaign will be thrown back at you if you can't deliver. <p>But you've survived worse. Two bullets couldn't stop you. A divided convention couldn't stop you. And now you've got four more years to finish what you started: to bring peace abroad, build the Great Society at home, and prove that Lyndon Johnson was no accident of history. Get some sleep while you can, Mr. President. Tomorrow starts now.`;
            
            let rmSuffix = '';
            if (runningMateId === 219) {
                rmSuffix = `<p>You are glad that you didn't listen to the devil in your ear telling you to drop Humphrey. He stayed and helped you win this election.`;
            } else if (runningMateId === 225) {
                rmSuffix = `<p>Whether the 'Southern Strategy' worked or not, Wallace really shook up the campaign and made you look like an outsider. You owe him too much, and he sounds like an opportunist bastard, so make sure to keep him on a tight leash.`;
            } else if (runningMateId === 226) {
                rmSuffix = `<p>No one knows how the hell this happened with Morse. Even he himself is shocked, and the press is thinking that Americans might be more anti-war than previously expected.`;
            }
            
            const fullText = baseSpeech + rmSuffix;
            
            return {
                slides: [{
                    imageUrl: endingImage,
                    endingHeader: header,
                    endingText: fullText
                }]
            };
        }

        // ----- PLAYER 217 WINS (Farris Bryant) -----
        else if (playerId === cand217Id) {
            let header = "THE NEW ORDER: BRYANT CAPTURES WHITE HOUSE IN HISTORIC SHOCKER";
            
            const baseSpeech = `Impossible. That was the word on every front page the morning after the election. Farris Bryant, the third-party governor of Florida running on a platform of segregation and closed borders, had done what no pollster, no pundit, and no politician believed possible.<p>The country convulsed.<p>From Harlem to Watts, Black neighborhoods erupted in grief and fury, the riots making the previous summers look like mere disturbances. In Miami, Cuban refugees barricaded themselves inside their homes as armed men roamed the streets, emboldened by a president-elect who had promised to send them back. Leftist organizers called for a general strike; shoutniks and beatniks clashed with police from Berkeley to Boston. Moscow's propaganda machine sprang to life overnight, broadcasting images of burning American cities and denouncing the "fascist takeover" in Washington.<p>Meanwhile, the institutions strained. FBI Director J. Edgar Hoover quietly opened an inquiry into voting irregularities across the Deep South, where turnout in some counties had somehow exceeded the number of registered voters. The Supreme Court braced for a flood of challenges to the result. No one knew whether the inauguration would even proceed as planned.<p>But you have never been a man who bends to chaos. You see enemies where others see anarchy, and you have a plan to crush both. The world may be shocked, but you intend to show them that Farris Bryant of Florida is here to stay and that he will drag America back to order, no matter the cost.`;
            
            return {
                slides: [{
                    imageUrl: endingImage,
                    endingHeader: header,
                    endingText: baseSpeech
                }]
            };
        }
    }

    // ==========================================
    // 3. PLAYER LOSES
    // ==========================================

    // ----- PLAYER 221 LOSES (Colonel Sanders) -----
    if (playerId === cand221Id && winnerId !== null && winnerId !== cand221Id) {
        let header = "";
        if (winCategory === 'narrow') header = "FINGER LICKIN' DEFEAT!";
        else if (winCategory === 'solid') header = "FRIED TO A CRISP!";
        else if (winCategory === 'landslide') header = "NOT EVEN CLOSE!";
        
        let endingText = "Your political adventure, which began in Kentucky in 1955 and carried you all the way to the Republican nomination, has come to an end. You couldn't quite beat an unpopular president; one weighed down by two wars, a recession, and riots in the streets. The country chose the Ranchman it trusted over the Colonel it didn't. In the end, maybe it was your education and inexperience they couldn't let go. Maybe it was the conservatives who were afraid of your civil rights record. Or maybe Americans just weren't ready to put their faith in a chicken salesman, no matter how good the chicken was. <p> You've still got your company waiting for you in Florence. Millie and Harley held things together during the campaign, but they'll be happy to see you back behind the desk, inspecting pressure fryers and reminding franchisees how to make the gravy right.";
        
        if (runningMateId === 218) {
            endingText += "<p>Goldwater whispers to you that your selection of Scranton is what made you lose because of his liberal tendencies. You don't know if it's true or not, but it's not like you can prove anything either way.";
        } else if (runningMateId === 223) {
            endingText += "<p>Press reports state that Smith's gender was a factor in the loss, and it seems like female vice presidents won't be considered again for a long while. You doubt whether that's actually true, but it matters very little to you at this point.";
        } else if (runningMateId === 224) {
            endingText += "<p>LBJ successfully leveraged Curtis' relationship with Goldwater and other hawks to paint you as a far-right radical. This defeat will definitely force Republicans to nominate more liberal candidates from now on.";
        }
        
        return {
            slides: [{
                imageUrl: endingImage,
                endingHeader: header,
                endingText: endingText
            }]
        };
    }

    // ----- PLAYER 216 LOSES (LBJ) -----
    else if (playerId === cand216Id && winnerId !== null && winnerId !== cand216Id) {
        let header = "";
        if (winCategory === 'narrow') header = "LBJ DEFEATED, BUT DEFIES POLLSTERS";
        else if (winCategory === 'solid') header = "BACK TO STONEWALL";
        else if (winCategory === 'landslide') header = "THE GREAT SOCIETY COLLAPSES: LANDSLIDE WIPES OUT LYNDON JOHNSON";
        
        let endingText = "You already saw this coming. Two wars that never seemed to end, a recession that gutted the working man's confidence, and a Democratic Party so fractured that half of it was running against you. The \"Lying Lyndon\" label stuck. For all the bills you passed and all the speeches you gave, the American people decided they'd had enough of the chaos, enough of the body bags, and enough of the promises that didn't come true. <p>History will remember the Civil Rights Act and Medicare. It will also remember that you survived two attempts on your life and kept fighting. But four years of crisis is a heavy weight, and the voters decided to set it down. <p>Now, maybe it's time to set it down yourself. Go back to the ranch in Stonewall. Sit on the porch with Lady Bird. Let the phone stop ringing for once. You've been running this country and your own body into the ground for years, and neither one can take much more. Rest. Walk the fields. Let somebody else carry the burden for a while.";
        
        if (runningMateId === 219) {
            endingText += "<p>Your running mate, Humphrey, on the other hand, still has a bright political future ahead of him. He is thinking of running for the Senate in the next midterms.";
        } else if (runningMateId === 225) {
            endingText += "<p>What were you even thinking when you selected that Alabamian as your running mate anyway? Wallace was simply outmatched everywhere outside the South, and even in the South, his appeal was pretty limited regionally. Your choice to drop Humphrey will be seen as a mistake even decades from now";
        } else if (runningMateId === 226) {
            endingText += "<p>Wayne was simply too out of touch with the mainstream. With the overwhelming hatred of the shoutnik and beatnik rioters among the Americans, your running mate was simply a nuisance to you. The press is saying that you should have stuck with Humphrey.";
        }
        
        return {
            slides: [{
                imageUrl: endingImage,
                endingHeader: header,
                endingText: endingText
            }]
        };
    }

    // ----- PLAYER 217 LOSES (Farris Bryant) -----
    else if (playerId === cand217Id && winnerId !== null && winnerId !== cand217Id) {
        let header = "NO SEAT AT THE TABLE: BRYANT'S FAILURE";
        
        let baseText = "You gave it everything you had. You barnstormed through the South, packed rallies in the North, and tried to pry the white working man away from both Johnson and Sanders. But in the end, the electoral math didn't break your way. The Solid South wasn't solid enough for you, and the border states didn't fall. ";
        
        let suffixText = "";
        
        if (winnerId === cand216Id) {
            baseText += "LBJ won outright, and your Heritage Independence Party will go down as a footnote.";
            if (runningMateId === 220) {
                suffixText = "<p>Patterson takes some of the blame, saying he didn't do enough to grab votes from the president despite having a Democratic Party past.";
            } else if (runningMateId === 227) {
                suffixText = "<p>Your selection of Thurmond as the vice president could have hand in this, as he pulled votes away from Sanders, resulting in a Democrat win.";
            }
        } else if (winnerId === cand221Id) {
            baseText += "Sanders won outright, and your Heritage Independence Party will go down as a footnote.";
            if (runningMateId === 220) {
                suffixText = "<p>Your selection of Patterson as your running mate could have played a hand in this, as he pulled votes away from LBJ, resulting in a Republican win.";
            } else if (runningMateId === 227) {
                suffixText = "<p>Thurmond take some of the blame, saying he didn't do enough to grab votes from the Colonel despite having a Republican party past.";
            }
        }
        
        return {
            slides: [{
                imageUrl: endingImage,
                endingHeader: header,
                endingText: baseText + suffixText
            }]
        };
    }

    // ==========================================
    // 4. FALLBACK (should never be reached)
    // ==========================================
    return {
        slides: [{
            imageUrl: "https://placecats.com/500/500",
            endingHeader: "Unexpected Outcome",
            endingText: "The election result could not be processed correctly."
        }]
    };
}

function onAnswerPicked(engine, answerPicked) {
}

function onScenarioStarted(engine) {
}

export { onScenarioStarted, createEnding, onAnswerPicked };