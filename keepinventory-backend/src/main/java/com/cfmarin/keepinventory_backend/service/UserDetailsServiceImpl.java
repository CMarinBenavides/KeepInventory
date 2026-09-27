package com.cfmarin.keepinventory_backend.service;

import com.cfmarin.keepinventory_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

        private final UserRepository repository;

        @Override
        public UserDetails loadUserByUsername(String username)
                        throws UsernameNotFoundException {

                return repository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "No existe un usuario con username: " + username));
        }
}