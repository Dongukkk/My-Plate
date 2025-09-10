package com.app.dto.user;

public class UserStats {
    private int reviewCount;     // 내 리뷰 수
    private int bookmarkCount;   // 즐겨찾기 수
    private int visitCount;      // 방문 수
    private double averageRating; // 평균 평점

    public UserStats() { }

    public UserStats(int reviewCount, int bookmarkCount, int visitCount, double averageRating) {
        this.reviewCount = reviewCount;
        this.bookmarkCount = bookmarkCount;
        this.visitCount = visitCount;
        this.averageRating = averageRating;
    }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public int getBookmarkCount() { return bookmarkCount; }
    public void setBookmarkCount(int bookmarkCount) { this.bookmarkCount = bookmarkCount; }

    public int getVisitCount() { return visitCount; }
    public void setVisitCount(int visitCount) { this.visitCount = visitCount; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
}
