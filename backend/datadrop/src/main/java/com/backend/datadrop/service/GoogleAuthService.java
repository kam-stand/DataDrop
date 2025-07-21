package com.backend.datadrop.service;

import com.backend.datadrop.dao.UserDao;
import com.backend.datadrop.dao.AccessTokenDao;
import com.backend.datadrop.model.User;
import com.backend.datadrop.model.AccessToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoogleAuthService {

    private final UserDao userDao;
    private final AccessTokenDao accessTokenDao;

    public GoogleAuthService(UserDao userDao, AccessTokenDao accessTokenDao) {
        this.userDao = userDao;
        this.accessTokenDao = accessTokenDao;
    }

    @Transactional
    public User saveOrUpdateUser(String googleId, String name, String email, String accessToken, String refreshToken, long expiresIn) {
        User user = userDao.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(googleId);
                    newUser.setName(name);
                    newUser.setEmail(email);
                    return userDao.save(newUser);
                });

        // Save Access Token
        AccessToken token = new AccessToken();
        token.setUserId(user.getId());
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setExpiresIn(expiresIn);

        accessTokenDao.save(token);
        return user;
    }
}
