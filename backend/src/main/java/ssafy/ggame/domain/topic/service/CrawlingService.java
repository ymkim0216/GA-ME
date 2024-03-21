package ssafy.ggame.domain.topic.service;

import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ssafy.ggame.domain.topic.dto.TopicNewsResDto;
import ssafy.ggame.global.common.BaseResponse;
import ssafy.ggame.global.common.StatusCode;
import ssafy.ggame.global.exception.BaseException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CrawlingService {

    private final WebDriver driver;

    public ResponseEntity<Object> getCrawlingData(String keyword){
        List<TopicNewsResDto> hotTopicDtoList = new ArrayList<>();

        try {

            //시작 URL
            String URL = "https://www.gamemeca.com/search.php?q=" + keyword;
            driver.get(URL);

            // 크롤링하려는 웹 페이지가 로딩 되는 시간을 기다림
            driver.manage().timeouts().implicitlyWait(Duration.ofMillis(10));
            // 게임 정보로 이동
            WebElement elements = driver.findElement(By.cssSelector("#content > div.news-list > div.content-left > ul.list_gamedata.search > li > a"));
            elements.click();

            //새창으로 이동
            changeWindow();

            //뉴스로 이동
            WebElement gameNew = driver.findElement(By.cssSelector("#content > div.content-left > div.db-sub-menu > ul > li:nth-child(2) > a"));
            gameNew.click();


            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");


            List<WebElement> news = driver.findElements(By.cssSelector("#content > div.content-left > div.news-list > ul > li"));
            for (WebElement n : news) {
                String link = n.findElement(By.cssSelector("a")).getAttribute("href");
                String img = n.findElement(By.cssSelector("a > img")).getAttribute("src");
                String title = n.findElement(By.cssSelector("div.cont_thumb > strong > a")).getText();
                String desc = n.findElement(By.cssSelector("div.desc_thumb")).getText();
                String dateString = n.findElement(By.cssSelector("div.day_news")).getText();
                LocalDate date = LocalDate.parse(dateString, formatter);
                TopicNewsResDto hotTopicDto = TopicNewsResDto.builder()
                        .hotTopicLink(link)
                        .hotTopicImg(img)
                        .hotTopicTitle(title)
                        .hotTopicShortDesc(desc)
                        .hotTopicDate(date)
                        .build();
                hotTopicDtoList.add(hotTopicDto);
            }
        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new BaseException(StatusCode.CRAWLING_FAILED));
        }
        if(hotTopicDtoList.isEmpty()) throw new BaseException(StatusCode.CRAWLING_NOT_FOUND);
        return ResponseEntity.status(HttpStatus.OK).body(new BaseResponse<>(hotTopicDtoList));

    }

    private void changeWindow() {
        // 현재 창의 핸들을 저장
        String currentWindowHandle = driver.getWindowHandle();

        // 현재 창 닫기
        driver.close();

        Set<String> handles = driver.getWindowHandles();

        // 새로운 창으로 전환
        for (String handle : handles) {
            if (!handle.equals(currentWindowHandle)) {
                driver.switchTo().window(handle);
                break;
            }
        }
    }

}
