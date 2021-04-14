const puppy = require("puppeteer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const fetch = require("node-fetch");


const email = "sarabpreets04@gmail.com";
const password = "sarab78903";

let index=0;
//let budget = 40000;
let finalData = [];
let itemUrls= [];
let arguments = process.argv.slice(2);


async function main(arguments){
    let item = arguments.slice(0,arguments.length-1).join(" ");
    let budget = arguments.slice(arguments.length-1)
    const browser = await puppy.launch({
        headless: false,
        defaultViewport:false,
    })
    const page = await browser.newPage();
    await page.goto("https://www.amazon.in");
    await page.waitForSelector(".layoutToolbarPadding a[data-nav-role='signin']")
    await page.click(".layoutToolbarPadding a[data-nav-role='signin']");
    await page.goto("https://www.amazon.in/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3Fref_%3Dnav_ya_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=inflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&");
    await page.waitForSelector("#ap_email",{visible:true})
    await page.type("#ap_email",email);
    await page.click("#continue");
    await page.waitForSelector("#ap_password",{visible:true})
    await page.type("#ap_password",password);
    await page.click("#signInSubmit");
    await page.waitForSelector("#twotabsearchtextbox",{visible:true})
    await page.type("#twotabsearchtextbox",item);
    await page.keyboard.press("Enter");
    await getTitles(page);
    await viewItems(itemUrls,page);
    console.log(finalData);
    await sendMail();
    
    fs.writeFileSync("project.json",JSON.stringify(finalData));
    


    async function sendMail(){
        
    var transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
        user:"sarabpreets04@gmail.com",
        pass: "sarab78903"
        }
    });
    var mailOptions= {
    from:email,
    to:"sarabpreets7@gmail.com",
    subject: "List of items matching your budget",
    text: JSON.stringify(finalData,null,4)
    }
    transporter.sendMail(mailOptions,function(error,info){
    if(error){
        console.log(error);
    }
    else{
        console.log("Email sent: "+info.response)
    }
    })
        }

    async function getTitles(page){
        for(let idx=0;idx<4;idx++){
            await page.waitForSelector(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2 a")
            let titles = await page.$$(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2 a")
            await getUrls(titles);
            await autoScroll(page);

            await page.waitForSelector(".a-pagination li")
            let navs =await page.$$(".a-pagination li");
            await navs[navs.length-1].click();

            await new Promise(function(resolve,reject){
                setTimeout(function(){
                    return resolve();
                },2000)
            })
        }
        console.log(itemUrls);
        console.log(itemUrls.length);



    }

    
    async function getUrls(titles){
    for(let i=0;i<titles.length;i++){
        let link  = await page.evaluate(function(el){
            return el.getAttribute("href");
        },titles[i])
        itemUrls.push("https://www.amazon.in"+link);
    }
}
async function setValues(page,price){
    
    let itemTitle =await page.$("#productTitle")
                    if(itemTitle){
                        let name = await page.evaluate(function(el){
                            return el.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
                        },itemTitle)
                        //itemData["itemName"] = name;
                        
                        finalData.push({"itemName":name});
                        console.log(name);
                    }
                        if(finalData[index]){
                            //itemData["price"] = price;
                        finalData[index]["price"] = price;
                        console.log(price)
                        }
                    let itemStat = await page.$("#availability");
                    if(itemStat&& finalData[index]){
                        let status = await page.evaluate(function(el){
                            return el.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
                        },itemStat) 
                        if(status.length<50){
                        //itemData["status"] = status;
                        finalData[index]["status"] = status;
                        console.log(status)
                        }
                    }
        
                    let itemDesc = await page.$(".a-unordered-list.a-vertical.a-spacing-mini")
                    if(itemDesc&& finalData[index]){
                        let desc = await page.evaluate(function(el){
                            return el.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
                        },itemDesc) 
                        //itemData["itemDescription"] = desc;
                        finalData[index]["itemDescription"] = desc;
                    }
                    index++;
}

    async function viewItems(itemUrls,page){
        for(let i=0;i<21;i++){
            await page.goto(itemUrls[i]);
            let itemP = await page.$("#priceblock_ourprice");
            if(itemP){
                let price = await page.evaluate(function(el){
                    return el.textContent
                },itemP) 
                //console.log(price)
                price =price.substring(1)
               let nprice = price.replace(",","");
               
                if(parseInt(nprice)<=budget){
                    
                    await setValues(page,nprice);
                }

            }
            
            
        }
    }

    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
    
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
    

}



main(arguments);


